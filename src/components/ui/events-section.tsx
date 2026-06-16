"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAdminData, type Event } from '@/lib/admin-data-context';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Clock, MapPin, Users, ArrowRight, Building2, Images, X, Loader2, ExternalLink, Check } from 'lucide-react';

export const categoryColors: Record<string, string> = {
  Worship: "bg-primary/10 text-primary",
  Prayer: "bg-prayer/10 text-prayer",
  Youth: "bg-success/10 text-success",
  Study: "bg-accent/10 text-accent-foreground",
  Outreach: "bg-destructive/10 text-destructive",
  Fellowship: "bg-muted text-muted-foreground"
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
            <div className="grid grid-cols-3 gap-3">
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
          <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {new Date(event.date).toLocaleDateString()}</div>
          <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {event.time}</div>
          <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {event.location}</div>
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
export const EventsSection = () => {
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
    <section id="events" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-4xl font-bold">Upcoming Events</h2>
            <p className="text-xl text-muted-foreground">
              Join us for worship, fellowship, and community outreach
            </p>
          </div>

          {/* Campus & Group Selector */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                <SelectTrigger className="w-[180px] h-9 text-sm">
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
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-[180px] h-9 text-sm">
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
              const availability = getAvailabilityStatus(event.registered, event.capacity);
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
                    <p className="text-sm text-muted-foreground leading-relaxed">
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
                      <span className={`text-xs font-medium ${availability.color}`}>
                        {availability.text}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Host: {event.host}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        disabled={event.registered >= event.capacity}
                        onClick={() => setRsvpEvent(event)}
                        className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      >
                        {event.registered >= event.capacity ? 'Full' : 'RSVP'}
                        {event.registered < event.capacity && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                      </Button>
                      {event.googlePhotosUrl && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => setAlbumEvent(event)}
                          title="View Event Photos"
                        >
                          <Images className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
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