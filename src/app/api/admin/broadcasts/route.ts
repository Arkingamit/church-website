import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Broadcast from '@/models/Broadcast';
import User from '@/models/User';
import { verifySession } from '@/lib/auth-utils';

export async function GET() {
  try {
    await connectToDatabase();
    const session = await verifySession();
    if (!session.isAuth || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await User.findById(session.userId);
    if (!user || !['group_leader', 'campus_leader', 'admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const query: any = {};
    if (user.role === 'campus_leader') {
      query.$or = [
        { targetCampuses: { $in: [user.campusId, 'all'] } },
        { createdBy: session.userId },
      ];
    } else if (user.role === 'group_leader') {
      query.createdBy = session.userId;
    }

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
    const session = await verifySession();
    if (!session.isAuth || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await User.findById(session.userId);
    if (!user || !['group_leader', 'campus_leader', 'admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, materialLinks, targetCampuses, targetGroups } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const broadcast = await Broadcast.create({
      title,
      description,
      materialLinks: materialLinks || [],
      targetCampuses: targetCampuses || ['all'],
      targetGroups: targetGroups || [],
      createdBy: session.userId,
      createdByName: user.name || `${user.firstName} ${user.lastName}`,
    });

    return NextResponse.json(broadcast, { status: 201 });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
