import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Broadcast from '@/models/Broadcast';
import User from '@/models/User';
import { verifySession } from '@/lib/auth-utils';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const session = await verifySession();
    if (!session.isAuth || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await User.findById(session.userId);
    if (!user || !['group_leader', 'campus_leader', 'admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const broadcast = await Broadcast.findById(id);
    if (!broadcast) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Only creator or higher roles can delete
    if (broadcast.createdBy !== session.userId && !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Broadcast.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
