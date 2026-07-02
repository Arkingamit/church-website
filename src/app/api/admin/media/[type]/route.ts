import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminWithScope, requireAuth, enforceCampusScope, enforceGroupScope } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import { Sermon, SermonSeries, WorshipVideo, GalleryAlbum, LiveStream } from '@/models/Media';

export const dynamic = 'force-dynamic';

const models: any = {
  sermons: Sermon,
  'sermon-series': SermonSeries,
  'worship-videos': WorshipVideo,
  gallery: GalleryAlbum,
  livestreams: LiveStream,
};

export async function GET(req: Request, { params }: { params: Promise<{ type: string }> }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { type } = await params;
    const Model = models[type];

    if (!Model) {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    // .lean() returns plain JS objects — 30-50% faster than full Mongoose documents
    const items = await Model.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ type: string }> }) {
  const admin = await requireAdminWithScope();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { type } = await params;
    const Model = models[type];

    if (!Model) {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    const body = await req.json();

    // Enforce scope for models that support it
    if (type === 'gallery') {
      body.targetCampuses = enforceCampusScope(admin.role, admin.campusId, body.targetCampuses);
      body.targetGroups = enforceGroupScope(admin.role, admin.groups, body.targetGroups);
    } else if (type === 'livestreams') {
      if (admin.role === 'campus_leader' || admin.role === 'group_leader') {
        body.campusId = admin.campusId;
      }
    }

    const item = await Model.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
