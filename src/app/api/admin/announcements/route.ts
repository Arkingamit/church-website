import { requireAdminWithScope, enforceCampusScope, enforceGroupScope } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import Announcement from '@/models/Announcement';
import { calculateNextOccurrence } from '@/lib/recurrence';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-helpers';
import Notification from '@/models/Notification';
import { sendPushToTargeted } from '@/lib/push-utils';

export async function GET() {
  return withErrorHandler(async () => {
    const admin = await requireAdminWithScope();
    if (!admin) return apiError('Unauthorized', 401);

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
    return apiSuccess(announcements);
  });
}

export async function POST(req: Request) {
  return withErrorHandler(async () => {
    const admin = await requireAdminWithScope();
    if (!admin) return apiError('Unauthorized', 401);

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

    await Notification.create({
      title: `New Announcement: ${announcement.title}`,
      message: announcement.content.substring(0, 100) + (announcement.content.length > 100 ? '...' : ''),
      type: 'new_announcement',
      sourceId: announcement._id.toString(),
      targetCampuses: announcement.targetCampuses || ['all'],
      targetGroups: announcement.targetGroups || [],
    });

    await sendPushToTargeted({
      title: `New Announcement: ${announcement.title}`,
      body: announcement.content.substring(0, 100) + (announcement.content.length > 100 ? '...' : ''),
      type: 'new_announcement'
    }, announcement.targetCampuses || ['all'], announcement.targetGroups || []);

    return apiSuccess(announcement, 201);
  });
}
