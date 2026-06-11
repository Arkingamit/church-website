import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 });
    }
    const { firstName, lastName, email, password, phone, campusId } = parseResult.data;

    await connectToDatabase();
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Passwords will be hashed in the User API or here.
    // For direct registration, it's pending status. No password required for initial pending.
    // Wait, the form includes a password field, we should hash it.
    const bcrypt = require('bcryptjs');
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }

    const newUser = await User.create({
      ...body,
      status: 'pending',
      role: 'member',
      groups: [],
    });

    return NextResponse.json({ success: true, message: 'Registration submitted for approval.' }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
