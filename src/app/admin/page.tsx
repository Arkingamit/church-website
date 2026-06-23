"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminData } from '@/lib/admin-data-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Megaphone,
  Users,
  ArrowRight,
  Clock,
  TrendingUp,
  Building2,
  Shield,
  ImageIcon,
  Music,
  Play,
  Radio,
  QrCode,
  Droplet,
  Heart,
  Plus,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Bell,
  Video
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { 
    events, announcements, users, campuses, currentUser, 
    worshipVideos, sermons, sermonSeries, galleryAlbums, 
    liveStreams, prayerRequests 
  } = useAdminData();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [fabOpen, setFabOpen] = useState(false);
  const sermonsScrollRef = useRef<HTMLDivElement>(null);

  // Close FAB menu when clicking outside
  useEffect(() => {
    const handleClick = () => setFabOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const totalRegistered = events.reduce((sum, e) => sum + e.registered, 0);

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
  const isCampusLeader = currentUser.role === 'campus_leader' || isAdmin;
  const isGroupLeader = currentUser.role === 'group_leader' || isCampusLeader;

  // Stats for the top of the page
  const stats = [
    {
      label: 'Total Events',
      value: events.length,
      icon: Calendar,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Upcoming',
      value: upcomingEvents.length,
      icon: Clock,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Announcements',
      value: announcements.length,
      icon: Megaphone,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Total RSVPs',
      value: totalRegistered,
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  // Map series ID to its title
  const seriesMap = new Map(sermonSeries.map(s => [s.id, s.title]));

  // Build unified Recent Activity list
  const activityItems: Array<{
    type: 'EVENT' | 'NEWS' | 'PRAYER' | 'MEDIA';
    title: string;
    timestamp: Date;
    rawTime: string;
    badge: string;
    icon: React.ElementType;
    iconColor: string;
    badgeStyle: string;
  }> = [];

  // 1. Events
  events.forEach(e => {
    activityItems.push({
      type: 'EVENT',
      title: e.title,
      timestamp: new Date(e.createdAt || e.date),
      rawTime: e.createdAt || e.date,
      badge: 'EVENT',
      icon: Calendar,
      iconColor: 'text-blue-500 bg-blue-50 border border-blue-100',
      badgeStyle: 'text-blue-600 bg-blue-50 border-blue-100'
    });
  });

  // 2. Announcements
  announcements.forEach(a => {
    activityItems.push({
      type: 'NEWS',
      title: a.title,
      timestamp: new Date(a.createdAt),
      rawTime: a.createdAt,
      badge: 'NEWS',
      icon: Bell,
      iconColor: 'text-purple-500 bg-purple-50 border border-purple-100',
      badgeStyle: 'text-purple-600 bg-purple-50 border-purple-100'
    });
  });

  // 3. Prayers
  prayerRequests.forEach(p => {
    activityItems.push({
      type: 'PRAYER',
      title: `Prayer request from ${p.authorName}`,
      timestamp: new Date(p.createdAt),
      rawTime: p.createdAt,
      badge: 'PRAYER',
      icon: Droplet,
      iconColor: 'text-rose-500 bg-rose-50 border border-rose-100',
      badgeStyle: 'text-rose-600 bg-rose-50 border-rose-100'
    });
  });

  // 4. Media (Sermons)
  sermons.forEach(s => {
    activityItems.push({
      type: 'MEDIA',
      title: s.title,
      timestamp: new Date(s.date),
      rawTime: s.date,
      badge: 'MEDIA',
      icon: Video,
      iconColor: 'text-amber-500 bg-amber-50 border border-amber-100',
      badgeStyle: 'text-amber-600 bg-amber-50 border-amber-100'
    });
  });

  // Sort activities: most recent first, limit to 6 items
  const sortedActivities = activityItems
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 6);

  // Time formatter matching the mockup rules
  function formatActivityTime(dateInput: Date | string, type: string) {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear();
                    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && 
                        date.getMonth() === yesterday.getMonth() && 
                        date.getFullYear() === yesterday.getFullYear();

    if (type === 'EVENT') {
      if (isToday) {
        return `Today · ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      }
      if (isYesterday) {
        return `Yesterday · ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      }
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const isTomorrow = date.getDate() === tomorrow.getDate() && 
                          date.getMonth() === tomorrow.getMonth() && 
                          date.getFullYear() === tomorrow.getFullYear();
      if (isTomorrow) {
        return `Tomorrow · ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      }
      
      const diffDays = Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        return `${date.toLocaleDateString([], { weekday: 'long' })} · ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      }
      
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }

    if (Math.abs(diffMs) < 24 * 60 * 60 * 1000) {
      if (diffMs > 0) {
        if (diffMins < 60) {
          return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
        }
        return `${diffHours} hours ago`;
      }
    }

    if (isYesterday) {
      return `Yesterday · ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }

    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }

  // Scroll handler for Recent Sermons
  const handleScroll = () => {
    const container = sermonsScrollRef.current;
    if (container) {
      const totalScroll = container.scrollWidth - container.clientWidth;
      if (totalScroll > 0) {
        setScrollProgress((container.scrollLeft / totalScroll) * 100);
      }
    }
  };

  const scrollSermons = (direction: 'left' | 'right') => {
    const container = sermonsScrollRef.current;
    if (container) {
      const scrollAmount = 240;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-8 pb-16 relative">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your church management</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/40 bg-card/60 shadow-sm hover:shadow transition-all duration-300">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isCampusLeader && (
          <Card className="border border-amber-100 bg-amber-50/70 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-amber-900">Worship Homepage</h3>
                  <Music className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-xs text-amber-800/80 leading-relaxed max-w-sm">
                  Manage video items that appear on the homepage carousel.
                </p>
              </div>
              <div className="mt-4">
                <Link href="/admin/worship" className="inline-flex items-center text-sm font-bold text-amber-700 hover:text-amber-850 transition-colors">
                  Manage <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {isCampusLeader && (
          <Card className="border border-blue-100 bg-blue-50/70 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-blue-900">Campus Broadcasts</h3>
                  <Radio className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-blue-800/80 leading-relaxed max-w-sm">
                  Configure live worship feeds and stream settings.
                </p>
              </div>
              <div className="mt-4">
                <Link href="/admin/live" className="inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-850 transition-colors">
                  Manage <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card className="border border-purple-100 bg-purple-50/70 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-purple-900">Gallery Config</h3>
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-purple-800/80 leading-relaxed max-w-sm">
                  Organize event photos and media albums.
                </p>
              </div>
              <div className="mt-4">
                <Link href="/admin/gallery" className="inline-flex items-center text-sm font-bold text-purple-700 hover:text-purple-855 transition-colors">
                  Manage <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card className="border border-emerald-100 bg-emerald-50/70 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-emerald-900">Daily Verses</h3>
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-emerald-800/80 leading-relaxed max-w-sm">
                  Curate and schedule scriptural verses.
                </p>
              </div>
              <div className="mt-4">
                <Link href="/admin/verses" className="inline-flex items-center text-sm font-bold text-emerald-700 hover:text-emerald-850 transition-colors">
                  Manage <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions Buttons */}
      {isCampusLeader && (
        <div className="grid grid-cols-2 gap-4">
          <Link href="/admin/qr-codes" className="block">
            <div className="flex items-center justify-center gap-3 p-4 bg-rose-50/50 border border-rose-100 hover:bg-rose-50 transition-all duration-300 rounded-2xl shadow-sm text-center cursor-pointer group">
              <QrCode className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-bold text-sm text-rose-950">QR Codes</span>
            </div>
          </Link>
          
          <Link href="/admin/users" className="block">
            <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-all duration-300 rounded-2xl shadow-sm text-center cursor-pointer group">
              <Users className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-bold text-sm text-slate-900">Users</span>
            </div>
          </Link>
        </div>
      )}

      {/* Recent Sermons Carousel */}
      {isAdmin && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Sermons</h2>
          
          {sermons.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border/50">
              No sermons found. Link sermons to YouTube in sermon configuration.
            </div>
          ) : (
            <div className="relative">
              {/* Scrollable Container */}
              <div 
                ref={sermonsScrollRef} 
                onScroll={handleScroll}
                className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {sermons.map((sermon) => {
                  const seriesTitle = seriesMap.get(sermon.seriesId) || 'Series 1';
                  return (
                    <Link key={sermon.id} href="/admin/sermons" className="min-w-[160px] w-[160px] shrink-0 group block">
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                        <img 
                          src={`https://img.youtube.com/vi/${sermon.videoId}/hqdefault.jpg`} 
                          alt={sermon.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                      </div>
                      <h4 className="font-bold text-sm text-foreground mt-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {sermon.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{seriesTitle}</p>
                    </Link>
                  );
                })}
              </div>
              
              {/* Custom Styled Scrollbar Track & Nav Buttons */}
              <div className="flex items-center gap-2 mt-2 max-w-md">
                <button 
                  onClick={() => scrollSermons('left')}
                  className="text-foreground/80 hover:text-foreground text-xs p-1 select-none active:scale-90 transition-transform"
                >
                  ◀
                </button>
                <div className="flex-1 h-3 bg-neutral-800 rounded overflow-hidden relative border border-neutral-700/40">
                  <div 
                    className="absolute top-0 bottom-0 bg-neutral-400 rounded transition-all duration-150"
                    style={{ 
                      left: `${scrollProgress}%`, 
                      width: '40%',
                      transform: `translateX(-${scrollProgress * 0.4}%)`
                    }}
                  />
                </div>
                <button 
                  onClick={() => scrollSermons('right')}
                  className="text-foreground/80 hover:text-foreground text-xs p-1 select-none active:scale-90 transition-transform"
                >
                  ▶
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Activity</h2>
          <Link href="/admin/announcements" className="text-xs font-bold text-red-700 hover:text-red-800 transition-colors">
            View all
          </Link>
        </div>

        <Card className="border border-border/50 bg-card rounded-2xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {sortedActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              <div className="divide-y divide-border/40">
                {sortedActivities.map((activity, idx) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.iconColor}`}>
                          <ActivityIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{activity.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatActivityTime(activity.rawTime, activity.type)}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase shrink-0 ml-3 border ${activity.badgeStyle}`}
                      >
                        {activity.badge}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button (FAB) & Menu */}
      {isGroupLeader && (
        <div 
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
          onClick={(e) => e.stopPropagation()} // Stop propagation to prevent closing FAB immediately
        >
          {fabOpen && (
            <div className="bg-popover border border-border/60 shadow-2xl rounded-2xl p-2 w-48 mb-2 flex flex-col gap-1 animate-in slide-in-from-bottom-5 fade-in duration-200">
              <Link href="/admin/announcements" onClick={() => setFabOpen(false)}>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Megaphone className="w-4 h-4 text-purple-500" />
                  <span>Post News</span>
                </div>
              </Link>
              <Link href="/admin/events" onClick={() => setFabOpen(false)}>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Create Event</span>
                </div>
              </Link>
              {isAdmin && (
                <Link href="/admin/sermons" onClick={() => setFabOpen(false)}>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <Play className="w-4 h-4 text-rose-500" />
                    <span>Add Sermon</span>
                  </div>
                </Link>
              )}
              <Link href="/admin/prayers" onClick={() => setFabOpen(false)}>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span>Prayer Request</span>
                </div>
              </Link>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFabOpen(!fabOpen);
            }}
            className={`w-14 h-14 rounded-full bg-red-800 hover:bg-red-900 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform ${fabOpen ? 'rotate-45 bg-red-900' : ''}`}
            aria-label="Quick Actions"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
