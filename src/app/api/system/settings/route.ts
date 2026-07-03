import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { SystemSettings } from '@/models/SystemSettings';
import { requireAdmin } from '@/lib/api-auth';

// GET is public so the app can check version on launch
export async function GET() {
  try {
    await connectToDatabase();
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({ minAppVersion: '0.1.0' });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch system settings' }, { status: 500 });
  }
}

// PUT is restricted to Admins (Super Admins should be enforced in UI or here)
export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin || admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized. Super Admin required.' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body = await req.json();
    
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create(body);
    } else {
      settings = await SystemSettings.findOneAndUpdate({}, body, { new: true });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update system settings' }, { status: 500 });
  }
}
