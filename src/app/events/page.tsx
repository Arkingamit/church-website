"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdminData, type Event } from '@/lib/admin-data-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Users, ArrowRight, Images, ChevronLeft } from 'lucide-react';
import { EventPhotoModal, EventRSVPModal, categoryColors, ticketColors, formatTime, getAvailabilityStatus } from '@/components/ui/events-section';

import { useAuth } from '@/lib/auth-context';

export default function EventsPage() {
  const { events, eventRegistrations, currentUser, getVisibleEvents } = useAdminData();
  const { getSessionMember, getEffectiveGroups } = useAuth();
  const [albumEvent, setAlbumEvent] = useState<Event | null>(null);
  const [rsvpEvent, setRsvpEvent] = useState<Event | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const myRegistrations = useMemo(() => {
    if (!currentUser) return [];
    const registeredEventIds = eventRegistrations
      .filter(reg => reg.userEmail === currentUser.email)
      .map(reg => reg.eventId);
    // Remove duplicates if same user registered multiple times
    const uniqueIds = Array.from(new Set(registeredEventIds));
    return events.filter(e => uniqueIds.includes(e.id));
  }, [events, eventRegistrations, currentUser]);

  const visibleEvents = useMemo(() => {
    const sessionMember = getSessionMember();
    if (!sessionMember) {
      // If not logged in, only see "all" campus / "all" groups events (or maybe guest-allowed)
      // We'll treat guest as having 'global' campus and no special groups
      return getVisibleEvents('global', []);
    }
    const effectiveGroups = getEffectiveGroups(sessionMember);
    const isAdminOrLeader = sessionMember.role === 'admin' || sessionMember.role === 'super_admin' || sessionMember.role === 'campus_leader';
    const userGroups = isAdminOrLeader ? ['all'] : Array.from(new Set([...effectiveGroups, 'all']));
    
    return getVisibleEvents(sessionMember.campusId || 'all', userGroups);
  }, [getSessionMember, getEffectiveGroups, getVisibleEvents]);

  const upcomingEvents = useMemo(() => {
    return visibleEvents.filter(e => new Date(e.date) >= today)
                 .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [visibleEvents]);

  const pastEvents = useMemo(() => {
    return visibleEvents.filter(e => new Date(e.date) < today)
                 .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [visibleEvents]);

  const renderEventGrid = (eventList: Event[]) => {
    if (eventList.length === 0) {
      return (
        <div className="text-center py-20 glass-card rounded-3xl border-0">
          <Calendar className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2 italic">Nothing here yet</h3>
          <p className="text-muted-foreground">No events found in this category.</p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventList.map((event) => {
          const availability = getAvailabilityStatus(event.registered, event.capacity);
          const isPast = new Date(event.date) < today;

          return (
            <div key={event.id} className="relative flex bg-card shadow-lg rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-300 group border border-border/50">
              
              {/* Left side: Date Block (Solid Color) */}
              <div className={`w-24 sm:w-28 shrink-0 flex flex-col items-center justify-center p-3 text-center relative ${ticketColors[event.category] || 'bg-primary text-primary-foreground'} ${isPast ? 'opacity-50 grayscale' : ''}`}>
                <span className="text-sm font-bold uppercase tracking-wider opacity-90">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-3xl sm:text-4xl font-black leading-none my-1">
                  {new Date(event.date).toLocaleDateString('en-US', { day: '2-digit' })}
                </span>
                <span className="text-[10px] sm:text-xs font-medium opacity-90">
                  {formatTime(event.time)}
                </span>
                
                {/* Right border dashed effect to simulate ticket stub */}
                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white/30 to-transparent border-r-2 border-dashed border-white/20"></div>
              </div>

              {/* Right side: Event Details */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between relative bg-card">
                {/* Ticket Cutouts */}
                <div className="absolute top-0 bottom-0 left-0 w-4 flex flex-col justify-between -translate-x-1/2 pointer-events-none z-10">
                  <div className="w-4 h-2 bg-muted/30 rounded-b-full border-b border-border/50"></div>
                  <div className="w-4 h-2 bg-muted/30 rounded-t-full border-t border-border/50"></div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`${categoryColors[event.category]} border-current opacity-90 text-[10px] px-2 py-0.5`}>
                      {event.category}
                    </Badge>
                    {event.recurring && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-border">Recurring</Badge>
                    )}
                    {isPast && (
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5">Ended</Badge>
                    )}
                  </div>
                  <h3 className={`text-lg font-bold leading-tight transition-colors line-clamp-2 ${isPast ? 'text-muted-foreground' : 'group-hover:text-primary'}`}>
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-1.5 mt-4 mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isPast ? '' : 'text-primary/70'}`} />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className={`w-3.5 h-3.5 shrink-0 ${isPast ? '' : 'text-primary/70'}`} />
                    <span>
                      {event.registered > 0
                        ? `${event.registered}/${event.capacity} registered`
                        : `Up to ${event.capacity} attendees`
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-border/40 mt-2 mb-2">
                  <span className={`text-xs font-medium ${isPast ? 'text-muted-foreground' : availability.color}`}>
                    {isPast ? 'Event Ended' : availability.text}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Host: {event.host}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <Button 
                    disabled={isPast || event.registered >= event.capacity}
                    onClick={() => setRsvpEvent(event)}
                    className="flex-1 h-9 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    {isPast ? 'Ended' : event.registered >= event.capacity ? 'Full' : 'RSVP'}
                    {!isPast && event.registered < event.capacity && <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                  {event.googlePhotosUrl && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-primary hover:bg-primary/10"
                      onClick={() => setAlbumEvent(event)}
                      title="View Event Photos"
                    >
                      <Images className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12">
      <main className="flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <Link href="/#events">
                <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-4 h-4" /> Back to Home
                </Button>
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Grace Calendar</h1>
              <p className="text-xl text-muted-foreground">
                Stay connected with our community events, services, and gatherings.
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="registered">Registered</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6">
                {renderEventGrid(upcomingEvents)}
              </TabsContent>

              <TabsContent value="registered" className="space-y-6">
                {!currentUser ? (
                  <div className="text-center py-20 glass-card rounded-3xl border-0">
                    <Users className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2 italic">Sign In Required</h3>
                    <p className="text-muted-foreground">Please sign in to view your event registrations.</p>
                  </div>
                ) : (
                  renderEventGrid(myRegistrations)
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-6">
                {renderEventGrid(pastEvents)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Photo Album Modal */}
      {albumEvent && (
        <EventPhotoModal event={albumEvent} onClose={() => setAlbumEvent(null)} />
      )}

      {/* RSVP Modal */}
      {rsvpEvent && (
        <EventRSVPModal event={rsvpEvent} onClose={() => setRsvpEvent(null)} />
      )}
    </div>
  );
}
