import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Broadcast from '@/models/Broadcast';
import { requireAdminWithScope, enforceCampusScope, enforceGroupScope } from '@/lib/api-auth';

export async function GET() {
  try {
    await connectToDatabase();
    const admin = await requireAdminWithScope();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let query: any = {};

    if (admin.role === 'campus_leader') {
      query.$or = [
        { targetCampuses: { $in: [admin.campusId, 'all'] } },
        { createdBy: admin.userId },
      ];
    } else if (admin.role === 'group_leader') {
      query.$or = [
        { targetCampuses: { $in: [admin.campusId, 'all'] }, targetGroups: { $in: [...admin.groups] } },
        { createdBy: admin.userId },
      ];
    }
    // admin/super_admin: no filter — see everything

    const broadcasts = await Broadcast.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(broadcasts);
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const admin = await requireAdminWithScope();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, description, materialLinks } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Enforce scope restrictions
    const targetCampuses = enforceCampusScope(admin.role, admin.campusId, body.targetCampuses);
    const targetGroups = enforceGroupScope(admin.role, admin.groups, body.targetGroups);

    const broadcast = await Broadcast.create({
      title,
      description,
      materialLinks: materialLinks || [],
      targetCampuses,
      targetGroups,
      createdBy: admin.userId,
      createdByName: admin.name || '',
    });

    return NextResponse.json(broadcast, { status: 201 });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
