import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import EventModel from '@/models/Event';
import { calculateNextOccurrence } from '@/lib/recurrence';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    // Auto-calculate nextOccurrence when updating to recurring
    if (body.recurring) {
      body.nextOccurrence = calculateNextOccurrence(
        body.recurrencePattern || 'weekly',
        body.recurrenceDay,
        body.date || new Date().toISOString().split('T')[0],
        body.recurrenceEndDate
      );
    } else if (body.recurring === false) {
      body.nextOccurrence = null;
      body.lastTriggered = null;
    }

    const event = await EventModel.findByIdAndUpdate(id, body, { new: true });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { id } = await params;
    const event = await EventModel.findByIdAndDelete(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
