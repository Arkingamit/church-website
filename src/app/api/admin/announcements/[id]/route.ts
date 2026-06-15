import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import Announcement from '@/models/Announcement';
import { calculateNextOccurrence } from '@/lib/recurrence';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    // Auto-calculate nextOccurrence when updating to recurring
    if (body.isRecurring) {
      body.nextOccurrence = calculateNextOccurrence(
        body.recurrencePattern || 'weekly',
        body.recurrenceDay,
        body.date || new Date().toISOString().split('T')[0],
        body.recurrenceEndDate
      );
    } else if (body.isRecurring === false) {
      body.nextOccurrence = null;
      body.lastTriggered = null;
    }

    const announcement = await Announcement.findByIdAndUpdate(id, body, { new: true });
    
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }
    
    return NextResponse.json(announcement);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { id } = await params;
    const announcement = await Announcement.findByIdAndDelete(id);
    
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
