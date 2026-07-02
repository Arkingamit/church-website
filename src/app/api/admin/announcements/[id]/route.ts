import { NextResponse } from 'next/server';
import { requireAdminWithScope, enforceCampusScope, enforceGroupScope } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import Announcement from '@/models/Announcement';
import { calculateNextOccurrence } from '@/lib/recurrence';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminWithScope();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    // Enforce scope on update
    body.targetCampuses = enforceCampusScope(admin.role, admin.campusId, body.targetCampuses);
    body.targetGroups = enforceGroupScope(admin.role, admin.groups, body.targetGroups);

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
  const admin = await requireAdminWithScope();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { id } = await params;

    // Verify the announcement is within the user's scope before deleting
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // campus_leader can only delete announcements targeting their campus
    if (admin.role === 'campus_leader') {
      const targets = announcement.targetCampuses || [];
      if (!targets.includes(admin.campusId) && !targets.includes('all')) {
        return NextResponse.json({ error: 'You can only delete announcements within your campus' }, { status: 403 });
      }
    } else if (admin.role === 'group_leader') {
      const targets = announcement.targetCampuses || [];
      if (!targets.includes(admin.campusId) && !targets.includes('all')) {
        return NextResponse.json({ error: 'You can only delete announcements within your scope' }, { status: 403 });
      }
    }

    await Announcement.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
