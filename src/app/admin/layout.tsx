import React from 'react';
import AdminLayoutClient from './admin-layout-client';
import { LiveStreamPoller } from '@/components/live-stream-poller';

export const dynamic = 'force-dynamic';

/**
 * Admin Layout — wraps only /admin/* routes.
 * AdminDataProvider is already available from the global Providers wrapper.
 * LiveStreamPoller is scoped here so it only runs for admin users,
 * not for every public visitor.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LiveStreamPoller />
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </>
  );
}
