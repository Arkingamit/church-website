import { verifySession } from './auth-utils';

/**
 * Ensures the requester is authenticated and has an admin-level role.
 * Reads role directly from the JWT — no database query required.
 * Returns a lightweight session object if authorized, or null if not.
 */
export async function requireAdmin() {
  const session = await verifySession();

  if (!session.isAuth || !session.userId) {
    return null;
  }

  // Role is embedded in the JWT — no DB round-trip needed
  const allowedRoles = ['admin', 'super_admin', 'campus_leader', 'group_leader'];
  if (!allowedRoles.includes(session.role)) {
    return null;
  }

  return { userId: session.userId, role: session.role };
}
