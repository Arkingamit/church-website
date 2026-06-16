import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Announcement from '@/models/Announcement';
import EventModel from '@/models/Event';
import Notification from '@/models/Notification';
import { calculateNextOccurrence, isTodayMatchingSchedule } from '@/lib/recurrence';

/**
 * POST /api/cron/recurring-announcements
 * 
 * This endpoint should be called once daily (e.g. via Vercel Cron, external scheduler,
 * or a manual trigger). It:
 * 1. Finds all recurring announcements and events due today
 * 2. Creates Notification records for the targeted audience
 * 3. Updates nextOccurrence and lastTriggered
 * 
 * Security: Protected by CRON_SECRET env variable.
 * For Vercel Cron, add to vercel.json:
 * { "crons": [{ "path": "/api/cron/recurring-announcements", "schedule": "0 6 * * *" }] }
 */
export async function POST(req: Request) {
  // Verify cron secret (optional but recommended)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Find all active recurring announcements
    const recurringAnnouncements = await Announcement.find({
      isRecurring: true,
      $or: [
        { recurrenceEndDate: { $exists: false } },
        { recurrenceEndDate: '' },
        { recurrenceEndDate: { $gte: today } },
      ],
    });

    // Find all future events that have reminders configured
    const futureEventsWithReminders = await EventModel.find({
      date: { $gte: today },
      $or: [
        { customReminders: { $exists: true, $not: { $size: 0 } } },
        { reminders: { $exists: true, $not: { $size: 0 } } }
      ]
    });

    let triggered = 0;
    let skipped = 0;

    // Process Announcements
    for (const announcement of recurringAnnouncements) {
      if (announcement.lastTriggered === today) {
        skipped++;
        continue;
      }

      if (!isTodayMatchingSchedule(announcement)) {
        skipped++;
        continue;
      }

      await Notification.create({
        title: `📢 ${announcement.title}`,
        message: announcement.content,
        type: 'recurring_announcement',
        sourceId: announcement._id.toString(),
        targetCampuses: announcement.targetCampuses || ['all'],
        targetGroups: announcement.targetGroups || ['all'],
      });

      const nextOccurrence = calculateNextOccurrence(
        announcement.recurrencePattern || 'weekly',
        announcement.recurrenceDay,
        today,
        announcement.recurrenceEndDate
      );

      await Announcement.findByIdAndUpdate(announcement._id, {
        lastTriggered: today,
        nextOccurrence: nextOccurrence,
      });

      triggered++;
    }

    // Process Event Reminders
    for (const event of futureEventsWithReminders) {
      // 1. Backwards compatibility for old "reminders" string array
      const eventDate = new Date(event.date);
      const todayDate = new Date(today);
      const diffTime = eventDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let shouldTriggerLegacy = false;
      if (event.reminders && event.reminders.length > 0) {
        if (diffDays === 0 && event.reminders.includes('0_days')) shouldTriggerLegacy = true;
        if (diffDays === 1 && event.reminders.includes('1_days')) shouldTriggerLegacy = true;
        if (diffDays === 3 && event.reminders.includes('3_days')) shouldTriggerLegacy = true;
        if (diffDays === 7 && event.reminders.includes('7_days')) shouldTriggerLegacy = true;
      }

      const legacyReminderKey = `rem_${diffDays}_${today}`;
      let triggeredKeys = event.lastTriggered ? event.lastTriggered.split(',') : [];

      if (shouldTriggerLegacy && !triggeredKeys.includes(legacyReminderKey)) {
        await Notification.create({
          title: `📅 Reminder: ${event.title}`,
          message: diffDays === 0 ? `Starts today at ${event.time}!` : `Starts in ${diffDays} day(s)! ${event.description || ''}`,
          type: 'event_reminder',
          sourceId: event._id.toString(),
          targetCampuses: event.targetCampuses || ['all'],
          targetGroups: event.targetGroups || ['all'],
        });
        triggeredKeys.push(legacyReminderKey);
        triggered++;
      } else {
        skipped++;
      }

      // 2. Process new customReminders (Relative Days, Hours, Minutes Before)
      if (event.customReminders && event.customReminders.length > 0) {
        for (const rem of event.customReminders) {
          if (typeof rem.daysBefore !== 'number' || typeof rem.hoursBefore !== 'number' || typeof rem.minutesBefore !== 'number') continue;
          
          const customReminderKey = `custom_rem_${rem.daysBefore}d_${rem.hoursBefore}h_${rem.minutesBefore}m_${event._id}`;
          
          // Calculate the exact target datetime for the reminder
          const eventDateTime = new Date(`${event.date}T${event.time || '00:00'}:00`);
          const offsetMs = (rem.daysBefore * 24 * 60 * 60 * 1000) + (rem.hoursBefore * 60 * 60 * 1000) + (rem.minutesBefore * 60 * 1000);
          const reminderDateTime = new Date(eventDateTime.getTime() - offsetMs);
          const now = new Date();
          
          // We trigger if we have passed the reminder time, but the event hasn't started yet
          if (now >= reminderDateTime && now <= eventDateTime && !triggeredKeys.includes(customReminderKey)) {
            await Notification.create({
              title: `📅 Reminder: ${event.title}`,
              message: `Starts soon at ${event.time}! ${event.description || ''}`,
              type: 'event_reminder',
              sourceId: event._id.toString(),
              targetCampuses: event.targetCampuses || ['all'],
              targetGroups: event.targetGroups || ['all'],
            });
            triggeredKeys.push(customReminderKey);
            triggered++;
          }
        }
      }

      // Save updated triggered keys
      if (triggeredKeys.join(',') !== event.lastTriggered) {
        await EventModel.findByIdAndUpdate(event._id, {
          lastTriggered: triggeredKeys.join(','),
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: today,
      processed: recurringAnnouncements.length + futureEventsWithReminders.length,
      triggered,
      skipped,
    });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Failed to process recurring tasks' }, { status: 500 });
  }
}

// Also allow GET for easy testing / manual trigger
export async function GET(req: Request) {
  return POST(req);
}
