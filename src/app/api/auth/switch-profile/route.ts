import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { decrypt, createSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Find the requested user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the target user shares the same email as the currently logged-in user
    if (targetUser.email.toLowerCase() !== (session.email as string).toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized to switch to this profile' }, { status: 403 });
    }

    if (targetUser.status === 'pending') {
      return NextResponse.json({ error: 'This profile is pending approval from the campus leader' }, { status: 403 });
    }

    if (targetUser.status === 'rejected') {
      return NextResponse.json({ error: 'This profile was not approved' }, { status: 403 });
    }

    // Create a new session cookie for the target user
    await createSession(targetUser._id.toString(), targetUser.email, targetUser.name || `${targetUser.firstName} ${targetUser.lastName}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Switch Profile Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
