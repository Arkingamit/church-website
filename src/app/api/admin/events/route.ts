import { NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import EventModel from '@/models/Event';
import { eventSchema } from '@/lib/validations';
import { generateOccurrences } from '@/lib/recurrence';
import mongoose from 'mongoose';

// Projection for list view — omits heavy nested arrays (formFields, schedule)
// that are only needed when editing a specific event. Reduces payload ~40-70%.
const LIST_PROJECTION = {
  title: 1, date: 1, time: 1, endTime: 1, location: 1, category: 1,
  capacity: 1, registered: 1, image: 1, recurring: 1, seriesId: 1,
  isSeriesTemplate: 1, recurrencePattern: 1, recurrenceDay: 1,
  recurrenceEndDate: 1, recurrenceNote: 1, recurrenceWeekOfMonth: 1,
  nextOccurrence: 1, lastTriggered: 1, mapUrl: 1, host: 1,
  targetCampuses: 1, targetGroups: 1, excludeCampuses: 1, excludeGroups: 1,
  googlePhotosUrl: 1, isMultiDay: 1, endDate: 1, description: 1,
  customReminders: 1, reminders: 1, createdAt: 1,
};

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    // .lean() returns plain JS objects — 30-50% faster than full Mongoose documents
    const events = await EventModel.find({}, LIST_PROJECTION).sort({ date: 1, time: 1 }).lean();
    
    const AttendanceRecord = mongoose.models.AttendanceRecord || mongoose.model('AttendanceRecord');
    
    // Group attendance counts by eventId
    const attendanceCounts = await AttendanceRecord.aggregate([
      { $match: { eventId: { $exists: true, $ne: null } } },
      { $group: { _id: '$eventId', count: { $sum: 1 } } }
    ]);
    
    const attendanceMap = new Map(attendanceCounts.map(a => [a._id.toString(), a.count]));

    const eventsWithAttendance = events.map(ev => ({
      ...ev,
      attended: attendanceMap.get(ev._id.toString()) || 0
    }));

    return NextResponse.json(eventsWithAttendance);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const body = await req.json();
    const parseResult = eventSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 });
    }

    const eventData = parseResult.data as any;

    if (eventData.recurring) {
      // Ahead-of-time duplication
      const seriesId = new mongoose.Types.ObjectId().toString();

      const occurrences = generateOccurrences(
        eventData.date || new Date().toISOString().split('T')[0],
        eventData.recurrenceEndDate,
        eventData.recurrencePattern || 'weekly',
        eventData.recurrenceDay,
        eventData.recurrenceWeekOfMonth,
        52 // max 1 year of occurrences at a time
      );

      if (occurrences.length === 0) {
        return NextResponse.json({ error: 'No valid occurrences found for this pattern' }, { status: 400 });
      }

      const eventsToCreate = occurrences.map((dateStr, index) => ({
        ...eventData,
        date: dateStr,
        seriesId,
        isSeriesTemplate: index === 0,
        recurring: true,
      }));

      const createdEvents = await EventModel.insertMany(eventsToCreate);
      return NextResponse.json(createdEvents[0], { status: 201 });
    } else {
      const event = await EventModel.create(eventData);
      return NextResponse.json(event, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
