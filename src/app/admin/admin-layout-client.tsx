"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  useAdminData,
  canAccessAdmin,
  canManageUsers,
  canManageCampusesAndGroups,
  ROLE_LABELS,
  type UserRole,
} from '@/lib/admin-data-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Calendar,
  Megaphone,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Church,
  ArrowLeft,
  Shield,
  ShieldCheck,
  User,
  Crown,
  UserPlus,
  QrCode,
  Music,
  UserCheck,
  Heart,
  BookOpen,
} from 'lucide-react';

const roleIcons: Record<UserRole, React.ElementType> = {
  member: User,
  group_leader: UserCheck,
  campus_leader: Shield,
  admin: ShieldCheck,
  super_admin: Crown,
};

const roleColors: Record<UserRole, string> = {
  member: 'text-muted-foreground border-muted-foreground/30',
  group_leader: 'text-emerald-500 border-emerald-500/30',
  campus_leader: 'text-blue-500 border-blue-500/30',
  admin: 'text-amber-500 border-amber-500/30',
  super_admin: 'text-purple-500 border-purple-500/30',
};

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, campuses } = useAdminData();
  const { getPendingRequests } = useAuth();

  const isCampusLeader = currentUser.role === 'campus_leader';
  const pendingCount = isCampusLeader
    ? getPendingRequests(currentUser.campusId).length
    : getPendingRequests().length;
    
  const { getPendingPrayerRequests } = useAdminData();
  const pendingPrayersCount = isCampusLeader
    ? getPendingPrayerRequests(currentUser.campusId).length
    : getPendingPrayerRequests().length;

  // Build sidebar items based on role
  const sidebarItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, minRole: 'group_leader' as UserRole },
    { label: 'Events', href: '/admin/events', icon: Calendar, minRole: 'group_leader' as UserRole },
    { label: 'Announcements', href: '/admin/announcements', icon: Megaphone, minRole: 'group_leader' as UserRole },
    { label: 'Worship Videos', href: '/admin/worship', icon: Music, minRole: 'admin' as UserRole },
    { label: 'Prayer Wall', href: '/admin/prayers', icon: Heart, minRole: 'campus_leader' as UserRole, badge: pendingPrayersCount },
    { label: 'Daily Verses', href: '/admin/verses', icon: BookOpen, minRole: 'admin' as UserRole },
    { label: 'Requests', href: '/admin/requests', icon: UserPlus, minRole: 'campus_leader' as UserRole, badge: pendingCount },
    { label: 'QR Codes', href: '/admin/qr-codes', icon: QrCode, minRole: 'campus_leader' as UserRole },
    { label: 'Users', href: '/admin/users', icon: Users, minRole: 'campus_leader' as UserRole },
    { label: 'Settings', href: '/admin/settings', icon: Settings, minRole: 'super_admin' as UserRole },
  ];

  const roleHierarchy: Record<UserRole, number> = { member: 0, group_leader: 1, campus_leader: 2, admin: 3, super_admin: 4 };
  const visibleItems = sidebarItems.filter(item => roleHierarchy[currentUser.role] >= roleHierarchy[item.minRole]);

  // Access denied for members
  if (!canAccessAdmin(currentUser.role)) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You need at least Group Leader access to view the admin dashboard.
          </p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const RoleIcon = roleIcons[currentUser.role];

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 h-screen flex flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 z-40 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Church className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold truncate gradient-text">Grace Admin</h2>
              <p className="text-[10px] text-muted-foreground truncate">Management Portal</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && 'badge' in item && (item as any).badge > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {(item as any).badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Role Switcher + Actions */}
        <div className="p-2 border-t border-border/50 space-y-2">
          {!collapsed && (
            <div className="px-2 py-2 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-1">
                <RoleIcon className="w-3 h-3" />
                Signed in as
              </div>

              <Badge variant="outline" className={`text-[10px] w-full justify-center ${roleColors[currentUser.role]}`}>
                {ROLE_LABELS[currentUser.role]}
                {currentUser.role === 'campus_leader' && (
                  <span className="ml-1">· {campuses.find(c => c.id === currentUser.campusId)?.name}</span>
                )}
              </Badge>
            </div>
          )}

          {collapsed && (
            <div className="flex justify-center py-1" title={`${currentUser.name} (${ROLE_LABELS[currentUser.role]})`}>
              <RoleIcon className={`w-5 h-5 ${roleColors[currentUser.role].split(' ')[0]}`} />
            </div>
          )}

          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
              <ArrowLeft className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Back to Site</span>}
            </div>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="w-full justify-center">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
