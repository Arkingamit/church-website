import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Notification from '@/models/Notification';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import User from '@/models/User';

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
    const { payload } = await jwtVerify(token, secret);
    await connectToDatabase();
    const user = await User.findById(payload.userId);
    return user;
  } catch {
    return null;
  }
}

/**
 * GET /api/notifications
 * Fetches notifications for the current user based on their campus and groups.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();

    // Fetch notifications that target this user's campus/groups
    // A notification matches if:
    // 1. targetCampuses includes 'all' OR includes user's campusId
    // 2. targetGroups includes 'all' OR overlaps with user's groups
    const notifications = await Notification.find({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // last 30 days
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Filter by targeting
    const userCampusId = user.campusId || '';
    const userGroups = user.groups || [];

    const filtered = notifications.filter((n: any) => {
      const ec = n.excludeCampuses || [];
      const eg = n.excludeGroups || [];

      if (userCampusId && ec.includes(userCampusId)) return false;
      if (userGroups.some((g: string) => eg.includes(g))) return false;

      const campusMatch =
        !n.targetCampuses?.length ||
        n.targetCampuses.includes('all') ||
        n.targetCampuses.includes(userCampusId);

      const groupMatch =
        !n.targetGroups?.length ||
        n.targetGroups.includes('all') ||
        n.targetGroups.some((g: string) => userGroups.includes(g));

      return campusMatch && groupMatch;
    });

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read. Body: { ids: string[] }
 */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { ids } = await req.json();
    if (ids && ids.length) {
      await Notification.updateMany(
        { _id: { $in: ids } },
        { isRead: true }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
