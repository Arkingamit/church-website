"use client";

import React from 'react';
import Link from 'next/link';
import { useAdminData } from '@/lib/admin-data-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Megaphone,
  Pin,
  Users,
  ArrowRight,
  Clock,
  TrendingUp,
  Building2,
  Shield,
  ImageIcon,
  Link2,
  Music,
  Play,
  Radio,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { 
    events, announcements, users, campuses, currentUser, 
    galleryAlbumUrl, setGalleryAlbumUrl, worshipVideos,
    sermons, sermonSeries, galleryAlbums, liveStreams 
  } = useAdminData();

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pinnedAnnouncements = announcements.filter(a => a.isPinned);
  const totalRegistered = events.reduce((sum, e) => sum + e.registered, 0);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your church management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* Gallery Configuration (For Admins) */}
      {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
        <Card className="border-border/50 bg-accent/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center">
              <div className="p-8 space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-foreground text-xs font-semibold uppercase tracking-wider">
                  <ImageIcon className="w-3.5 h-3.5" /> Gallery Config
                </div>
                <h2 className="text-2xl font-bold">Photo Galleries</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                  Manage multiple photo albums and galleries. 
                  Share church moments and event highlights with the community.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/admin/gallery">
                    <Button variant="default" className="bg-accent text-accent-foreground hover:opacity-90 gap-2">
                      Manage Gallery <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground">
                    <span className="text-muted-foreground text-xs uppercase tracking-tighter">Albums:</span> {galleryAlbums.length}
                  </div>
                </div>
              </div>
              <div className="p-8 bg-muted/20 flex items-center justify-center shrink-0 border-l border-border/50 min-w-[240px]">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-tighter">Live Sync Active</p>
                    <p className="text-[10px] text-muted-foreground max-w-[140px]">
                      Connecting {galleryAlbums.length} albums from Google Photos cloud.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sermon Management Configuration (For Admins) */}
      {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
        <Card className="border-border/50 bg-red-50/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center">
              <div className="p-8 space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold uppercase tracking-wider">
                  <Play className="w-3.5 h-3.5" /> Sermon Config
                </div>
                <h2 className="text-2xl font-bold">Sermons & Playlists</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                  Manage your sermon series, playlists, and individual messages. 
                  Share your latest teachings with the community via YouTube.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/admin/sermons">
                    <Button variant="default" className="bg-red-600 hover:bg-red-700 gap-2">
                      Manage Sermons <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-muted-foreground text-xs uppercase tracking-tighter">Series:</span> {sermonSeries.length}
                    <span className="text-muted-foreground text-xs uppercase tracking-tighter ml-3">Videos:</span> {sermons.length}
                  </div>
                </div>
              </div>
              <div className="p-8 bg-muted/10 flex items-center justify-center shrink-0 border-l border-border/50 min-w-[240px]">
                <div className="grid grid-cols-2 gap-2">
                  {sermons.slice(0, 4).map((s) => (
                    <div key={s.id} className="w-16 h-12 rounded bg-muted overflow-hidden border border-border/50">
                      <img 
                        src={`https://img.youtube.com/vi/${s.videoId}/mqdefault.jpg`} 
                        alt="" 
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                  ))}
                  {sermons.length === 0 && (
                    <div className="col-span-2 text-center py-4">
                      <Play className="w-8 h-8 text-red-200 mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Worship Carousel Management (For Admins) */}
      {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
        <Card className="border-border/50 bg-amber-50/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center">
              <div className="p-8 space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-wider">
                  <Music className="w-3.5 h-3.5" /> Worship Carousel
                </div>
                <h2 className="text-2xl font-bold">Home Page Video Carousel</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                  Add and manage YouTube song videos that appear in the worship carousel on the home page.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/admin/worship">
                    <Button variant="default" className="bg-amber-500 hover:bg-amber-600 gap-2">
                      Manage Carousel Videos <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-muted-foreground text-xs uppercase tracking-tighter">Videos:</span> {worshipVideos.length}
                  </div>
                </div>
              </div>
              <div className="p-8 bg-muted/10 flex items-center justify-center shrink-0 border-l border-border/50 min-w-[240px]">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/20">
                    <Music className="w-8 h-8 text-amber-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Carousel items are kept in local state and loaded for the home page.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Stream Config (For Admins and Campus Leaders) */}
      {(currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'campus_leader') && (
        <Card className="border-border/50 bg-blue-50/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center">
              <div className="p-8 space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5" /> Live Stream Config
                </div>
                <h2 className="text-2xl font-bold">Live Worship Broadcasts</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                  Manage your campus live streams. Update the YouTube video ID and toggle the broadcast status so your congregation can join online.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/admin/live">
                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700 gap-2 text-white">
                      Manage Live Streams <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-muted-foreground text-xs uppercase tracking-tighter">Active Streams:</span> {liveStreams.filter(ls => ls.isLive).length}
                  </div>
                </div>
              </div>
              <div className="p-8 bg-muted/10 flex items-center justify-center shrink-0 border-l border-border/50 min-w-[240px]">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto border border-blue-500/20">
                    <Radio className="w-8 h-8 text-blue-500 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-tighter text-blue-600">Broadcast Control</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <h3 className="text-lg font-semibold">Recent Events</h3>
              <p className="text-sm text-muted-foreground">Latest events created</p>
            </div>
            <Link href="/admin/events">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.slice(0, 4).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()} · {event.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
                  <Users className="w-3 h-3" />
                  {event.registered}/{event.capacity}
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No events yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <h3 className="text-lg font-semibold">Recent Announcements</h3>
              <p className="text-sm text-muted-foreground">Latest church announcements</p>
            </div>
            <Link href="/admin/announcements">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.slice(0, 4).map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Megaphone className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{announcement.title}</p>
                      {announcement.isPinned && (
                        <Pin className="w-3 h-3 text-accent fill-current shrink-0" />
                      )}
                    </div>
                    {announcement.reminderDate && announcement.reminderTime && (
                      <p className="text-xs text-blue-500">
                        Scheduled: {announcement.reminderDate} at {announcement.reminderTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No announcements yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
