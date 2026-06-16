import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import EventModel from '@/models/Event';
import { eventSchema } from '@/lib/validations';
import { calculateNextOccurrence, generateOccurrences } from '@/lib/recurrence';
import mongoose from 'mongoose';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const events = await EventModel.find({}).sort({ date: 1, time: 1 });
    return NextResponse.json(events);
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
        isSeriesTemplate: index === 0, // First one acts as the template
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
