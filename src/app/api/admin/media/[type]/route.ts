import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import { Sermon, SermonSeries, WorshipVideo, GalleryAlbum, LiveStream } from '@/models/Media';

const models: any = {
  sermons: Sermon,
  'sermon-series': SermonSeries,
  'worship-videos': WorshipVideo,
  gallery: GalleryAlbum,
  livestreams: LiveStream,
};

export async function GET(req: Request, { params }: { params: Promise<{ type: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { type } = await params;
    const Model = models[type];
    
    if (!Model) {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    const items = await Model.find({}).sort({ sortOrder: 1, createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ type: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { type } = await params;
    const Model = models[type];
    
    if (!Model) {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    const body = await req.json();
    const item = await Model.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
