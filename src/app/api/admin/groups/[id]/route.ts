import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import Group from '@/models/Group';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const group = await Group.findByIdAndUpdate(id, body, { new: true });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A group with this name already exists' }, { status: 409 });
    }
    console.error('Error updating group:', error);
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const { id } = await params;
    const group = await Group.findByIdAndDelete(id);

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}
