import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import AttendanceSession from '@/models/AttendanceSession';
import AttendanceRecord from '@/models/AttendanceRecord';
import User from '@/models/User';
import { verifySession } from '@/lib/auth-utils';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const session = await verifySession();
    if (!session.isAuth || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the caller is a leader or admin
    const leader = await User.findById(session.userId);
    if (!leader) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const allowedRoles = ['admin', 'super_admin', 'campus_leader', 'group_leader'];
    if (!allowedRoles.includes(leader.role)) {
      return NextResponse.json({ error: 'Only leaders can scan members' }, { status: 403 });
    }

    const body = await req.json();
    const { sessionId, eventId, qrCode } = body;

    if (!qrCode || (!sessionId && !eventId)) {
      return NextResponse.json({ error: 'Missing required fields (qrCode and sessionId/eventId)' }, { status: 400 });
    }

    // Look up the member by their QR code
    const member = await User.findOne({ qrCode, status: 'approved' });
    if (!member) {
      return NextResponse.json({ error: 'Member not found', message: 'No approved member found with this QR code.' }, { status: 404 });
    }

    // Verify the session/event exists and is active
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    let startTime = '';
    let endTime = '';

    if (eventId) {
      const Event = mongoose.models.Event || mongoose.model('Event');
      const event = await Event.findById(eventId);
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      if (event.attendanceConfig) {
        const [startH, startM] = event.time.split(':').map(Number);
        const openTime = new Date(now);
        openTime.setHours(startH, startM - (event.attendanceConfig.openMinutesBefore || 0), 0, 0);

        const [endH, endM] = event.endTime.split(':').map(Number);
        const closeTime = new Date(now);
        closeTime.setHours(endH, endM + (event.attendanceConfig.closeMinutesAfter || 0), 0, 0);

        startTime = `${String(openTime.getHours()).padStart(2, '0')}:${String(openTime.getMinutes()).padStart(2, '0')}`;
        endTime = `${String(closeTime.getHours()).padStart(2, '0')}:${String(closeTime.getMinutes()).padStart(2, '0')}`;
      }
    } else {
      const attSession = await AttendanceSession.findById(sessionId);
      if (!attSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      startTime = attSession.startTime;
      endTime = attSession.endTime;
    }

    // Check time window
    if (startTime && endTime) {
      if (currentTimeStr < startTime || currentTimeStr > endTime) {
        return NextResponse.json({
          error: 'Outside time window',
          message: 'This check-in window is currently closed.'
        }, { status: 400 });
      }
    }

    // Check for duplicate
    const query: any = eventId
      ? { eventId, userId: member._id.toString(), date: todayStr }
      : { sessionId, userId: member._id.toString(), date: todayStr };

    const existing = await AttendanceRecord.findOne(query);
    if (existing) {
      return NextResponse.json({
        error: 'Already checked in',
        message: `${member.name} has already been checked in today.`,
        memberName: member.name,
      }, { status: 400 });
    }

    // Create attendance record
    const recordData: any = {
      userId: member._id.toString(),
      distance: 0,
      date: todayStr,
      method: 'leader_scan',
      scannedBy: session.userId,
    };
    if (eventId) recordData.eventId = eventId;
    else recordData.sessionId = sessionId;

    const record = await AttendanceRecord.create(recordData);

    return NextResponse.json({
      ...record.toObject(),
      memberName: member.name,
      memberEmail: member.email,
      memberCampusId: member.campusId,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in leader scan:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Already checked in', message: 'This member has already been checked in today.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
  }
}
