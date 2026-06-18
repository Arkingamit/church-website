"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdminData, type Event } from '@/lib/admin-data-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Users, ArrowRight, Images, ChevronLeft } from 'lucide-react';
import { EventPhotoModal, EventRSVPModal, categoryColors, formatTime, getAvailabilityStatus } from '@/components/ui/events-section';

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
            <Card key={event.id} className="overflow-hidden hover:shadow-elevated transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`${categoryColors[event.category] || 'bg-muted text-muted-foreground'} text-xs`}>
                      {event.category}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {event.recurring && (
                        <Badge variant="outline" className="text-xs">Recurring</Badge>
                      )}
                      {event.googlePhotosUrl && (
                        <button
                          onClick={() => setAlbumEvent(event)}
                          className="flex items-center gap-1 text-[10px] text-primary font-semibold bg-primary/10 hover:bg-primary/20 rounded-full px-2 py-0.5 transition-colors"
                        >
                          <Images className="w-3 h-3" />
                          Photos
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{formatTime(event.time)} - {formatTime(event.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span>
                      {event.registered > 0
                        ? `${event.registered}/${event.capacity} registered`
                        : `Up to ${event.capacity} attendees`
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className={`text-xs font-medium ${isPast ? 'text-muted-foreground' : availability.color}`}>
                    {isPast ? 'Event Ended' : availability.text}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Host: {event.host}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    disabled={isPast || event.registered >= event.capacity}
                    onClick={() => setRsvpEvent(event)}
                    className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    {isPast ? 'Ended' : event.registered >= event.capacity ? 'Full' : 'RSVP'}
                    {!isPast && event.registered < event.capacity && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
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
