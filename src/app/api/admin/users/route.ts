import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    // Exclude password, use .lean() for 30-50% faster serialization
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const body = await req.json();

    // Auto-fill required fields that might be missing from the admin UI
    if (body.name && (!body.firstName || !body.lastName)) {
      const parts = body.name.trim().split(' ');
      body.firstName = parts[0] || 'Unknown';
      body.lastName = parts.slice(1).join(' ') || 'Unknown';
    }

    if (!body.gender) {
      body.gender = 'male'; // Defaulting to pass validation if missing in admin form
    }

    // Set user status to pending, and record the admin who added them.
    // The creator admin must explicitly approve this request before the user can log in.
    body.status = 'pending';
    body.createdBy = admin.userId;

    // Hash password if provided
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }

    const user = await User.create(body);

    // Don't return password
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json(userObj, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
