import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Announcement from '@/models/Announcement';
import Notification from '@/models/Notification';
import { calculateNextOccurrence, isTodayMatchingSchedule } from '@/lib/recurrence';

/**
 * POST /api/cron/recurring-announcements
 * 
 * This endpoint should be called once daily (e.g. via Vercel Cron, external scheduler,
 * or a manual trigger). It:
 * 1. Finds all recurring announcements due today
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

    let triggered = 0;
    let skipped = 0;

    for (const announcement of recurringAnnouncements) {
      // Skip if already triggered today
      if (announcement.lastTriggered === today) {
        skipped++;
        continue;
      }

      // Check if today matches the schedule
      if (!isTodayMatchingSchedule(announcement)) {
        skipped++;
        continue;
      }

      // Create a notification
      await Notification.create({
        title: `📢 ${announcement.title}`,
        message: announcement.content,
        type: 'recurring_announcement',
        sourceId: announcement._id.toString(),
        targetCampuses: announcement.targetCampuses || ['all'],
        targetGroups: announcement.targetGroups || ['all'],
      });

      // Calculate next occurrence
      const nextOccurrence = calculateNextOccurrence(
        announcement.recurrencePattern || 'weekly',
        announcement.recurrenceDay,
        today,
        announcement.recurrenceEndDate
      );

      // Update the announcement
      await Announcement.findByIdAndUpdate(announcement._id, {
        lastTriggered: today,
        nextOccurrence: nextOccurrence,
      });

      triggered++;
    }

    return NextResponse.json({
      success: true,
      date: today,
      processed: recurringAnnouncements.length,
      triggered,
      skipped,
    });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Failed to process recurring announcements' }, { status: 500 });
  }
}

// Also allow GET for easy testing / manual trigger
export async function GET(req: Request) {
  return POST(req);
}
