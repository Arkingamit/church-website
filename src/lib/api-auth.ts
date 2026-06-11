import { verifySession } from './auth-utils';
import connectToDatabase from './db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

/**
 * Ensures the requester is authenticated and has an admin role.
 * Returns the user document if authorized, or null if unauthorized.
 */
export async function requireAdmin() {
  const { isAuth, userId } = await verifySession();
  if (!isAuth || !userId) {
    return null;
  }

  await connectToDatabase();
  const user = await User.findById(userId);
  
  if (!user) {
    return null;
  }

  // Check roles (admin, super_admin, or campus_leader)
  const allowedRoles = ['admin', 'super_admin', 'campus_leader'];
  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}
