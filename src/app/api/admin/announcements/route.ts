import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import Announcement from '@/models/Announcement';
import { calculateNextOccurrence } from '@/lib/recurrence';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    // .lean() returns plain JS objects — 30-50% faster than full Mongoose documents
    const announcements = await Announcement.find({})
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();
    return NextResponse.json(announcements);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const body = await req.json();

    // Auto-calculate nextOccurrence for recurring announcements
    if (body.isRecurring) {
      body.nextOccurrence = calculateNextOccurrence(
        body.recurrencePattern || 'weekly',
        body.recurrenceDay,
        body.date || new Date().toISOString().split('T')[0],
        body.recurrenceEndDate
      );
    }

    const announcement = await Announcement.create(body);
    return NextResponse.json(announcement, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
