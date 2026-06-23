import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import PrayerRequest from '@/models/PrayerRequest';
import User from '@/models/User';
import { verifySession } from '@/lib/auth-utils';
import { prayerRequestSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await verifySession();
    
    const prayers = await PrayerRequest.find({
      status: 'approved'
    }).sort({ createdAt: -1 });

    return NextResponse.json(prayers);
  } catch (error) {
    console.error('Error fetching prayer requests:', error);
    return NextResponse.json({ error: 'Failed to fetch prayer requests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const parseResult = prayerRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.errors },
        { status: 400 }
      );
    }
    
    const data = parseResult.data;
    const session = await verifySession();
    
    let authorName = data.authorName || 'Anonymous';
    let authorId = undefined;
    let campusId = data.campusId || 'global'; // Fallback for guest if they don't select one
    
    // If logged in, we can attribute it to the user if not anonymous
    if (session.isAuth && session.userId) {
      const user = await User.findById(session.userId);
      if (user) {
        if (!data.authorName) {
          authorName = `${user.firstName} ${user.lastName}`;
        }
        authorId = user._id;
        campusId = user.campusId; // Overwrite with actual session campus
      }
    }
    
    const prayer = await PrayerRequest.create({
      title: data.title,
      content: data.content,
      authorName: authorName,
      authorId: authorId,
      campusId: campusId,
      status: 'pending' // Defaulting to pending for admin approval
    });

    return NextResponse.json(prayer, { status: 201 });
  } catch (error) {
    console.error('Error creating prayer request:', error);
    return NextResponse.json({ error: 'Failed to create prayer request' }, { status: 500 });
  }
}
