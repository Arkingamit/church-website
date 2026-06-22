import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { decrypt } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Find all users with the same email
    const profiles = await User.find({ email: session.email })
      .select('firstName lastName name role status campusId email createdAt')
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(profiles, { status: 200 });
  } catch (error: any) {
    console.error('Fetch Profiles Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
