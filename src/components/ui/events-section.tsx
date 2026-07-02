"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAdminData, type Event } from '@/lib/admin-data-context';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Clock, MapPin, Users, ArrowRight, Building2, Images, X, Loader2, ExternalLink, Check, ChevronLeft } from 'lucide-react';



export const categoryColors: Record<string, string> = {
  Worship: "bg-primary/10 text-primary",
  Prayer: "bg-prayer/10 text-prayer",
  Youth: "bg-success/10 text-success",
  Study: "bg-accent/10 text-accent-foreground",
  Outreach: "bg-destructive/10 text-destructive",
  Fellowship: "bg-muted text-muted-foreground"
};

export const ticketColors: Record<string, string> = {
  Worship: "bg-primary text-primary-foreground",
  Prayer: "bg-prayer text-prayer-foreground",
  Youth: "bg-success text-success-foreground",
  Study: "bg-accent text-accent-foreground",
  Outreach: "bg-destructive text-destructive-foreground",
  Fellowship: "bg-secondary text-secondary-foreground"
};

const PREF_KEY = 'grace-user-prefs';

// ─── Event Photo Modal ──────────────────────────────────────────────────────
export function EventPhotoModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const [photos, setPhotos] = useState<{ id: number; src: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    if (!event.googlePhotosUrl) return;

    const fetch5Photos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/gallery/photos?url=${encodeURIComponent(event.googlePhotosUrl!)}`);
        const data = await res.json();
        if (data.photos) {
          setPhotos(data.photos.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to fetch event photos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch5Photos();
  }, [event.googlePhotosUrl]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div>
            <h3 className="font-bold text-lg">{event.title}</h3>
            <p className="text-sm text-muted-foreground">Event Photos</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Photos Grid */}
        <div className="p-5 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading photos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Images className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No photos could be loaded from this album.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {photos.length} preview photos</p>
          <a href={event.googlePhotosUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="gap-2">
              View Full Album <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Lightbox for individual photo */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <img src={selectedPhoto.src} alt={selectedPhoto.title} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Event RSVP Modal ───────────────────────────────────────────────────────
export function EventRSVPModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const { addEventRegistration, currentUser } = useAdminData();
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCheckboxChange = (fieldId: string, optLabel: string, checked: boolean) => {
    setErrorMsg('');
    setResponses((prev) => {
      const current = (prev[fieldId] as string[]) || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, optLabel] };
      } else {
        return { ...prev, [fieldId]: current.filter((l) => l !== optLabel) };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Custom Validation
    if (event.formFields) {
      for (const field of event.formFields) {
        const answer = responses[field.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          setErrorMsg(`Please answer all questions. "${field.label}" is missing.`);
          return;
        }
      }
    }

    setSubmitting(true);
    // Simulate network delay
    setTimeout(() => {
      addEventRegistration({
        eventId: event.id,
        userName: name,
        userEmail: email,
        responses,
      });
      setSubmitted(true);
      setSubmitting(false);
    }, 600);
  };

  if (submitted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md text-center py-12">
          <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl mb-2">You're Registered!</DialogTitle>
          <p className="text-muted-foreground mb-6">We've saved your spot for {event.title}. We look forward to seeing you there!</p>
          <Button onClick={onClose} className="w-full">Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>RSVP: {event.title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 bg-muted/30 p-3 rounded-lg">
          <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString()}</div>
          <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {event.time}</div>
          <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm border-b pb-2">Your Information</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>
            </div>
          </div>

          {/* Dynamic Forms */}
          {event.formFields && event.formFields.length > 0 && (
            <div className="space-y-6">
              <h4 className="font-semibold text-sm border-b pb-2">Event Questions</h4>
              {event.formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label} <span className="text-destructive">*</span>
                  </Label>

                  {field.type === 'text' && (
                    <Input
                      required
                      value={(responses[field.id] as string) || ''}
                      onChange={e => { setResponses(prev => ({ ...prev, [field.id]: e.target.value })); setErrorMsg(''); }}
                      placeholder="Your answer"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <Textarea
                      required
                      value={(responses[field.id] as string) || ''}
                      onChange={e => { setResponses(prev => ({ ...prev, [field.id]: e.target.value })); setErrorMsg(''); }}
                      placeholder="Your answer"
                      rows={3}
                    />
                  )}

                  {field.type === 'date' && (
                    <Input
                      type="date"
                      required
                      value={(responses[field.id] as string) || ''}
                      onChange={e => { setResponses(prev => ({ ...prev, [field.id]: e.target.value })); setErrorMsg(''); }}
                    />
                  )}

                  {field.type === 'select' && (
                    <Select
                      required
                      value={(responses[field.id] as string) || ''}
                      onValueChange={v => { setResponses(prev => ({ ...prev, [field.id]: v })); setErrorMsg(''); }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                      <SelectContent>
                        {(field.options || []).map(opt => (
                          <SelectItem key={opt.id} value={opt.label}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === 'radio' && (
                    <RadioGroup
                      required
                      value={(responses[field.id] as string) || ''}
                      onValueChange={v => { setResponses(prev => ({ ...prev, [field.id]: v })); setErrorMsg(''); }}
                      className="space-y-1 mt-2 pl-1"
                    >
                      {(field.options || []).map(opt => (
                        <div key={opt.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.label} id={`${field.id}-${opt.id}`} />
                          <Label htmlFor={`${field.id}-${opt.id}`} className="font-normal cursor-pointer text-muted-foreground">{opt.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="space-y-2 mt-2 pl-1">
                      {(field.options || []).map(opt => {
                        const isChecked = ((responses[field.id] as string[]) || []).includes(opt.label);
                        return (
                          <div key={opt.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-${opt.id}`}
                              checked={isChecked}
                              onCheckedChange={(c) => handleCheckboxChange(field.id, opt.label, !!c)}
                            />
                            <Label htmlFor={`${field.id}-${opt.id}`} className="font-normal cursor-pointer text-muted-foreground">{opt.label}</Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {errorMsg && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {errorMsg}
            </div>
          )}

          <Button type="submit" className="w-full bg-primary" disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {submitting ? 'Registering...' : 'Confirm RSVP'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const formatTime = (time: string) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export const getAvailabilityStatus = (registered: number, capacity: number) => {
  if (registered === 0) return { text: 'Open Registration', color: 'text-success' };
  const pct = (registered / capacity) * 100;
  if (pct >= 100) return { text: 'Full', color: 'text-destructive' };
  if (pct >= 90) return { text: 'Almost Full', color: 'text-accent' };
  if (pct >= 75) return { text: 'Filling Up', color: 'text-accent' };
  return { text: 'Available', color: 'text-success' };
};

// ─── Events Section ─────────────────────────────────────────────────────────


export function EventsSection({ variant = 'widget' }: { variant?: 'page' | 'widget' }) {
  if (variant === 'page') return <EventsPageLayout />;
  return <EventsWidgetLayout />;
}

function EventsWidgetLayout() {
  const { campuses, groups, getVisibleEvents } = useAdminData();
  const { getSessionMember, getEffectiveGroups } = useAuth();
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [albumEvent, setAlbumEvent] = useState<Event | null>(null);
  const [rsvpEvent, setRsvpEvent] = useState<Event | null>(null);

  // Load preferences
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREF_KEY);
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.campus) setSelectedCampus(prefs.campus);
        if (prefs.group) setSelectedGroup(prefs.group);
      }
    } catch { /* ignore */ }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(PREF_KEY, JSON.stringify({ campus: selectedCampus, group: selectedGroup }));
  }, [selectedCampus, selectedGroup]);

  // Merge family member's groups into visibility filter
  const sessionMember = getSessionMember();
  const effectiveGroups = sessionMember ? getEffectiveGroups(sessionMember) : [];

  const isAdminOrLeader = sessionMember?.role === 'admin' || sessionMember?.role === 'super_admin' || sessionMember?.role === 'campus_leader';
  const allowedGroups = isAdminOrLeader
    ? groups
    : Array.from(new Set([...effectiveGroups, 'all']));

  const userGroups = selectedGroup === 'all'
    ? allowedGroups
    : (allowedGroups.includes(selectedGroup) || isAdminOrLeader ? [selectedGroup] : []);

  const visibleEvents = getVisibleEvents(
    selectedCampus === 'all' ? 'all' : selectedCampus,
    userGroups as string[]
  );

  return (
    <section id="events" className="py-10 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-5 mb-10">
            <span className="section-heading">Events</span>
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">
              Join us for worship, fellowship, and community outreach
            </p>
          </div>

          {/* Campus & Group Selector */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
                  <SelectValue placeholder="Select Campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  {campuses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleEvents.map((event) => {
              return (
                <div key={event.id} className="relative bg-card shadow-lg rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-300 group border border-border/50">
                  <div className="flex flex-row">
                    {/* Left side: Date Block (Solid Color) */}
                    <div className={`w-24 shrink-0 flex flex-col items-center justify-center p-3 text-center relative ${ticketColors[event.category] || 'bg-primary text-primary-foreground'}`}>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold uppercase tracking-wider opacity-90">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-3xl font-black leading-none my-1">
                          {new Date(event.date).toLocaleDateString('en-US', { day: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-xs font-medium opacity-90 text-center">
                        {formatTime(event.time)}
                      </span>

                      {/* Right border dashed effect to simulate ticket stub */}
                      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white/30 to-transparent border-r-2 border-dashed border-white/20"></div>
                    </div>

                    {/* Event Details */}
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
                        </div>
                        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 mt-4 mb-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                          <span>{event.registered} registered</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row items-center gap-2 mt-auto">
                        <Button
                          onClick={() => setRsvpEvent(event)}
                          className="flex-1 h-9 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        >
                          RSVP <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        {event.googlePhotosUrl && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-9 h-9 flex-none text-primary hover:bg-primary/10"
                            onClick={() => setAlbumEvent(event)}
                            title="View Event Photos"
                          >
                            <Images className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events for your selection.</p>
              <p className="text-sm text-muted-foreground mt-1">Try selecting a different campus or group.</p>
            </div>
          )}

          {/* View All */}
          <div className="text-center mt-12">
            <Link href="/events">
              <Button variant="outline" size="lg" className="gap-2">
                View Full Calendar
                <Calendar className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Photo Album Modal */}
      {albumEvent && (
        <EventPhotoModal event={albumEvent} onClose={() => setAlbumEvent(null)} />
      )}

      {/* RSVP Modal */}
      {rsvpEvent && (
        <EventRSVPModal event={rsvpEvent} onClose={() => setRsvpEvent(null)} />
      )}
    </section>
  );
};

function EventsPageLayout() {
  const { events, eventRegistrations, currentUser, getVisibleEvents } = useAdminData();
  const { getSessionMember, getEffectiveGroups } = useAuth();
  const [albumEvent, setAlbumEvent] = useState<Event | null>(null);
  const [rsvpEvent, setRsvpEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

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
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 border-l-4 border-[#8B2323] pl-3 py-0.5 leading-none md:border-l-0 md:pl-0">Grace Calendar</h1>
              <p className="text-xl text-muted-foreground">
                Stay connected with our community events, services, and gatherings.
              </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex w-full overflow-x-auto no-scrollbar justify-start md:grid md:grid-cols-3 md:max-w-md mb-6 md:mb-8 bg-card/50 p-1 border border-border/50">
                <TabsTrigger className="shrink-0 rounded-lg px-4 py-2" value="upcoming">Upcoming Events</TabsTrigger>
                <TabsTrigger className="shrink-0 rounded-lg px-4 py-2" value="registered">Registered Events</TabsTrigger>
                <TabsTrigger className="shrink-0 rounded-lg px-4 py-2" value="past">Past Events</TabsTrigger>
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
