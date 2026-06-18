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

    // Find all scheduled announcements (one-time reminders)
    const scheduledAnnouncements = await Announcement.find({
      isRecurring: false,
      reminderDate: today,
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
      let triggeredKeys = announcement.lastTriggered ? announcement.lastTriggered.split(',') : [];
      let didTriggerAnything = false;

      const nextOccurrenceDateStr = announcement.nextOccurrence || calculateNextOccurrence(
        announcement.recurrencePattern || 'weekly',
        announcement.recurrenceDay,
        today,
        announcement.recurrenceEndDate
      );

      if (!nextOccurrenceDateStr) {
        skipped++;
        continue;
      }

      // If reminderTime is not set, default to 09:00 for the sake of relative math
      const targetTime = announcement.reminderTime || '09:00';
      const targetDateTime = new Date(`${nextOccurrenceDateStr}T${targetTime}:00`);
      const now = new Date();

      // 1. Process customReminders
      if (announcement.customReminders && announcement.customReminders.length > 0) {
        for (const rem of announcement.customReminders) {
           if (typeof rem.daysBefore !== 'number' || typeof rem.hoursBefore !== 'number' || typeof rem.minutesBefore !== 'number') continue;
           
           const customReminderKey = `custom_rem_${rem.daysBefore}d_${rem.hoursBefore}h_${rem.minutesBefore}m_${announcement._id}_${nextOccurrenceDateStr}`;
           
           const offsetMs = (rem.daysBefore * 24 * 60 * 60 * 1000) + (rem.hoursBefore * 60 * 60 * 1000) + (rem.minutesBefore * 60 * 1000);
           const reminderDateTime = new Date(targetDateTime.getTime() - offsetMs);
           
           // We trigger if we have passed the reminder time, but the main announcement hasn't fired yet
           if (now >= reminderDateTime && now <= targetDateTime && !triggeredKeys.includes(customReminderKey)) {
             await Notification.create({
               title: `📢 Reminder: ${announcement.title}`,
               message: announcement.content,
               type: 'recurring_announcement',
               sourceId: announcement._id.toString(),
               targetCampuses: announcement.targetCampuses || ['all'],
               targetGroups: announcement.targetGroups || ['all'],
               excludeCampuses: announcement.excludeCampuses || [],
               excludeGroups: announcement.excludeGroups || [],
             });
             triggeredKeys.push(customReminderKey);
             didTriggerAnything = true;
             triggered++;
           }
        }
      }

      // 2. Process actual recurring push
      const actualPushKey = `actual_push_${nextOccurrenceDateStr}_${announcement._id}`;
      // Fallback for backwards compatibility: If it doesn't have reminderTime, trigger it anytime today matching the old logic.
      const shouldPushActual = announcement.reminderTime ? (now >= targetDateTime) : isTodayMatchingSchedule(announcement);

      // If the old logic stored just the date 'YYYY-MM-DD' in lastTriggered, handle that gracefully
      if (triggeredKeys.includes(today)) {
        triggeredKeys.push(actualPushKey); // normalize to new format
      }

      if (shouldPushActual && !triggeredKeys.includes(actualPushKey)) {
        await Notification.create({
          title: `📢 ${announcement.title}`,
          message: announcement.content,
          type: 'recurring_announcement',
          sourceId: announcement._id.toString(),
          targetCampuses: announcement.targetCampuses || ['all'],
          targetGroups: announcement.targetGroups || ['all'],
          excludeCampuses: announcement.excludeCampuses || [],
          excludeGroups: announcement.excludeGroups || [],
        });

        // We will leave nextOccurrence as is. Tomorrow, calculateNextOccurrence will yield the next cycle.
        triggeredKeys.push(actualPushKey);
        didTriggerAnything = true;
        triggered++;
      }
      
      // Update the record if we triggered something
      if (didTriggerAnything) {
        // If the actual push occurred, calculate the next one (it will return next week once tomorrow hits, but we can proactively trigger recalculation on the next cron run by unsetting it, or we can just save it)
        // Let's just save the triggered keys. 
        await Announcement.findByIdAndUpdate(announcement._id, {
          lastTriggered: triggeredKeys.join(','),
          nextOccurrence: nextOccurrenceDateStr, // Ensure it is set
        });
      } else {
        skipped++;
      }
    }

    // Process Scheduled Announcements
    for (const announcement of scheduledAnnouncements) {
      if (!announcement.reminderTime) continue;
      
      const scheduledKey = `scheduled_${announcement.reminderDate}_${announcement.reminderTime}_${announcement._id}`;
      if (announcement.lastTriggered === scheduledKey) continue;

      const scheduledDateTime = new Date(`${announcement.reminderDate}T${announcement.reminderTime}:00`);
      const now = new Date();

      if (now >= scheduledDateTime) {
        await Notification.create({
          title: `📢 ${announcement.title}`,
          message: announcement.content,
          type: 'recurring_announcement',
          sourceId: announcement._id.toString(),
          targetCampuses: announcement.targetCampuses || ['all'],
          targetGroups: announcement.targetGroups || ['all'],
          excludeCampuses: announcement.excludeCampuses || [],
          excludeGroups: announcement.excludeGroups || [],
        });

        await Announcement.findByIdAndUpdate(announcement._id, {
          lastTriggered: scheduledKey,
        });

        triggered++;
      }
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
          excludeCampuses: event.excludeCampuses || [],
          excludeGroups: event.excludeGroups || [],
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
              excludeCampuses: event.excludeCampuses || [],
              excludeGroups: event.excludeGroups || [],
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
