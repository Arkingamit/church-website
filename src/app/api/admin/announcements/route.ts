import { NextResponse } from 'next/server';
import { requireAdminWithScope, enforceCampusScope, enforceGroupScope } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import Announcement from '@/models/Announcement';
import { calculateNextOccurrence } from '@/lib/recurrence';

export async function GET() {
  const admin = await requireAdminWithScope();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();

    let query: any = {};

    if (admin.role === 'campus_leader') {
      // Campus leaders see announcements targeting their campus or 'all'
      query.$or = [
        { targetCampuses: { $in: [admin.campusId, 'all'] } },
      ];
    } else if (admin.role === 'group_leader') {
      // Group leaders see announcements targeting their campus/all AND their groups
      query.$or = [
        { targetCampuses: { $in: [admin.campusId, 'all'] }, targetGroups: { $in: [...admin.groups, 'all'] } },
        { targetCampuses: { $in: [admin.campusId, 'all'] }, targetGroups: { $size: 0 } },
        { targetCampuses: { $in: [admin.campusId, 'all'] }, targetGroups: { $exists: false } },
      ];
    }
    // admin/super_admin: no filter — see everything

    const announcements = await Announcement.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();
    return NextResponse.json(announcements);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await requireAdminWithScope();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const body = await req.json();

    // Enforce scope restrictions
    body.targetCampuses = enforceCampusScope(admin.role, admin.campusId, body.targetCampuses);
    body.targetGroups = enforceGroupScope(admin.role, admin.groups, body.targetGroups);

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
