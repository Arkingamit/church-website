"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, Bell, Heart, Calendar, Megaphone } from 'lucide-react';
import { useAdminData } from '@/lib/admin-data-context';
import { Card } from '@/components/ui/card';

export default function NotificationsPage() {
  const { announcements, prayerRequests } = useAdminData();

  const notifications = useMemo(() => {
    const items = [];

    // Map Announcements to Notifications
    announcements.forEach((ann) => {
      items.push({
        id: `ann-${ann.id}`,
        type: 'announcement',
        title: ann.title,
        content: ann.content,
        date: new Date(ann.createdAt || Date.now()),
        icon: Megaphone,
        color: 'text-[#8B2323]',
        bgColor: 'bg-[#FBE8E8]',
      });
    });

    // Map Prayer Requests to Notifications
    if (prayerRequests) {
      prayerRequests.forEach((pr: any) => {
        items.push({
          id: `pr-${pr.id}`,
          type: 'prayer',
          title: pr.title || 'New Prayer Request',
          content: pr.content || pr.description || 'A community member has shared a prayer request.',
          date: new Date(pr.createdAt || pr.date || Date.now()),
          icon: Heart,
          color: 'text-[#A04A00]',
          bgColor: 'bg-[#F3EAE1]',
        });
      });
    }

    // Sort by date descending
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [announcements, prayerRequests]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24" style={{ backgroundImage: 'var(--bg-pattern)', backgroundRepeat: 'repeat', backgroundSize: '240px 240px' }}>
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#FAF7F2] border-b border-[#E5D5C5] shadow-sm pt-4 pb-4 px-4" style={{ backgroundImage: 'var(--bg-pattern)', backgroundRepeat: 'repeat', backgroundSize: '240px 240px' }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#7A6150] shadow-sm shrink-0 hover:bg-[#F3EAE1] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-serif text-[#1A202C]">Notifications</h1>
            {notifications.length > 0 && (
              <span className="bg-[#8B2323] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 pt-6 space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center opacity-80">
            <div className="w-16 h-16 rounded-full bg-[#E5D5C5] flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-[#7A6150]" />
            </div>
            <h3 className="text-lg font-bold font-serif text-[#3A2D27]">You're all caught up!</h3>
            <p className="text-sm text-[#7A6150]">There are no new notifications at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <Card key={notif.id} className="p-4 border-0 shadow-sm bg-white/90 backdrop-blur-sm rounded-2xl flex gap-4 hover:bg-white transition-colors active:scale-95 duration-150">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notif.bgColor}`}>
                    <Icon className={`w-5 h-5 ${notif.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-[#1A202C] truncate pr-2">{notif.title}</h4>
                      <span className="text-[10px] font-bold text-[#7A6150] shrink-0 whitespace-nowrap">
                        {notif.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A6150] leading-relaxed line-clamp-2">
                      {notif.content}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
