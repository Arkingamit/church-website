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

    // Find all active recurring events
    const recurringEvents = await EventModel.find({
      recurring: true,
      $or: [
        { recurrenceEndDate: { $exists: false } },
        { recurrenceEndDate: '' },
        { recurrenceEndDate: { $gte: today } },
      ],
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

    // Process Events
    for (const event of recurringEvents) {
      if (event.lastTriggered === today) {
        skipped++;
        continue;
      }

      if (!isTodayMatchingSchedule(event)) {
        skipped++;
        continue;
      }

      await Notification.create({
        title: `📅 ${event.title}`,
        message: `Event reminder: ${event.description}`,
        type: 'event_reminder',
        sourceId: event._id.toString(),
        targetCampuses: event.targetCampuses || ['all'],
        targetGroups: event.targetGroups || ['all'],
      });

      const nextOccurrence = calculateNextOccurrence(
        event.recurrencePattern || 'weekly',
        event.recurrenceDay,
        today,
        event.recurrenceEndDate
      );

      await EventModel.findByIdAndUpdate(event._id, {
        lastTriggered: today,
        nextOccurrence: nextOccurrence,
      });

      triggered++;
    }

    return NextResponse.json({
      success: true,
      date: today,
      processed: recurringAnnouncements.length + recurringEvents.length,
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
