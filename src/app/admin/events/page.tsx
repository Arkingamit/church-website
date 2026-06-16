"use client";

import React, { useState } from 'react';
import { useAdminData, canPublishAllCampuses, getGroupsForCampus, type Event, type EventScheduleDay, type FormField, type FormFieldType } from '@/lib/admin-data-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Calendar, Clock, MapPin, Users, Plus, Pencil, Trash2, Search, X,
  Megaphone, Globe, Building2, Image as ImageIcon, Link2, ListPlus, AlignLeft, CheckSquare, ChevronDown, Trash, ListEnd, Download, Repeat
} from 'lucide-react';

const EVENT_CATEGORIES = ['Worship', 'Prayer', 'Youth', 'Study', 'Outreach', 'Fellowship'];

const categoryColors: Record<string, string> = {
  Worship: 'bg-primary/10 text-primary',
  Prayer: 'bg-amber-500/10 text-amber-600',
  Youth: 'bg-emerald-500/10 text-emerald-600',
  Study: 'bg-blue-500/10 text-blue-600',
  Outreach: 'bg-rose-500/10 text-rose-600',
  Fellowship: 'bg-purple-500/10 text-purple-600',
};

const emptyForm = {
  title: '', description: '', date: '', time: '', endTime: '',
  location: '', category: 'Worship', capacity: 100, registered: 0,
  image: null as string | null, recurring: false, host: '',
  targetCampuses: ['all'] as string[],
  targetGroups: ['all'] as string[],
  googlePhotosUrl: '',
  formFields: [] as FormField[],
  isMultiDay: false,
  endDate: '',
  schedule: [] as EventScheduleDay[],
  recurrencePattern: 'weekly' as 'weekly' | 'biweekly' | 'monthly' | 'custom' | 'custom_monthly',
  recurrenceDay: 'Sunday',
  recurrenceWeekOfMonth: '1st',
  recurrenceEndDate: '',
  recurrenceNote: '',
  seriesId: '',
  isSeriesTemplate: false,
  mapUrl: '',
};

export default function EventsPage() {
  const { events, campuses, groups, groupScopes, currentUser, addEvent, updateEvent, deleteEvent } = useAdminData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [updateSeriesConfirm, setUpdateSeriesConfirm] = useState<{action: 'put' | 'delete', eventId: string} | null>(null);
  const [selectedEventForResponses, setSelectedEventForResponses] = useState<Event | null>(null);

  const { getEventRegistrations } = useAdminData();

  const isCampusLeader = currentUser.role === 'campus_leader';
  const isGroupLeader = currentUser.role === 'group_leader';
  const canAllCampuses = canPublishAllCampuses(currentUser.role);

  const filtered = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    
    // Group leaders only see events targeted at their groups
    if (isGroupLeader) {
      const eGroups = e.targetGroups ?? ['all'];
      if (!eGroups.includes('all') && !eGroups.some(g => currentUser.groups.includes(g))) {
        return false;
      }
    }
    return matchesSearch;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      targetCampuses: (isCampusLeader || isGroupLeader) ? [currentUser.campusId] : ['all'],
      targetGroups: isGroupLeader ? currentUser.groups : ['all'],
    });
    setDialogOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditingId(event.id);
    setForm({
      title: event.title, description: event.description, date: event.date,
      time: event.time, endTime: event.endTime, location: event.location,
      category: event.category, capacity: event.capacity, registered: event.registered,
      image: event.image, recurring: event.recurring, host: event.host,
      targetCampuses: event.targetCampuses ?? ['all'],
      targetGroups: event.targetGroups ?? ['all'],
      googlePhotosUrl: event.googlePhotosUrl || '',
      formFields: event.formFields || [],
      isMultiDay: event.isMultiDay || false,
      endDate: event.endDate || '',
      schedule: event.schedule || [],
      recurrencePattern: event.recurrencePattern || 'weekly',
      recurrenceDay: event.recurrenceDay || 'Sunday',
      recurrenceWeekOfMonth: event.recurrenceWeekOfMonth || '1st',
      recurrenceEndDate: event.recurrenceEndDate || '',
      recurrenceNote: event.recurrenceNote || '',
      seriesId: event.seriesId || '',
      isSeriesTemplate: event.isSeriesTemplate || false,
      mapUrl: event.mapUrl || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.date) return;
    if (!form.isMultiDay && !form.time) return;
    
    if (editingId !== null) {
      if (form.recurring && form.seriesId) {
        // Need to ask the user if they want to update the whole series
        setUpdateSeriesConfirm({ action: 'put', eventId: editingId });
        setDialogOpen(false);
        return;
      } else {
        updateEvent(editingId, form);
      }
    } else {
      addEvent(form);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const confirmSubmitSeries = (updateSeries: boolean) => {
    if (updateSeriesConfirm?.action === 'put') {
      updateEvent(updateSeriesConfirm.eventId, form, updateSeries);
      setForm(emptyForm);
      setEditingId(null);
    } else if (updateSeriesConfirm?.action === 'delete') {
      deleteEvent(updateSeriesConfirm.eventId, updateSeries);
      setDeleteConfirmId(null);
    }
    setUpdateSeriesConfirm(null);
  };

  const handleDeleteClick = (event: Event) => {
    if (event.recurring && event.seriesId) {
      setUpdateSeriesConfirm({ action: 'delete', eventId: event.id });
    } else {
      setDeleteConfirmId(event.id);
    }
  };

  const handleDelete = (id: string) => { deleteEvent(id); setDeleteConfirmId(null); };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Audience helpers
  const isAllCampuses = form.targetCampuses.includes('all');
  const isAllGroups = form.targetGroups.includes('all');

  const toggleCampusMode = (all: boolean) => {
    if (isCampusLeader || isGroupLeader) return;
    setForm(f => ({ ...f, targetCampuses: all ? ['all'] : [] }));
  };
  const toggleCampus = (id: string) => {
    if (isCampusLeader || isGroupLeader) return;
    setForm(f => {
      const has = f.targetCampuses.includes(id);
      const next = has ? f.targetCampuses.filter(c => c !== id) : [...f.targetCampuses.filter(c => c !== 'all'), id];
      return { ...f, targetCampuses: next.length === 0 ? ['all'] : next };
    });
  };
  const toggleGroupMode = (all: boolean) => {
    if (isGroupLeader) return;
    setForm(f => ({ ...f, targetGroups: all ? ['all'] : [] }));
  };
  const toggleGroup = (g: string) => {
    if (isGroupLeader) return;
    setForm(f => {
      const has = f.targetGroups.includes(g);
      const next = has ? f.targetGroups.filter(x => x !== g) : [...f.targetGroups.filter(x => x !== 'all'), g];
      return { ...f, targetGroups: next.length === 0 ? ['all'] : next };
    });
  };

  // ── Multi-day Schedule Helpers ──
  const toggleMultiDay = (enabled: boolean) => {
    setForm(f => ({
      ...f,
      isMultiDay: enabled,
      endDate: enabled ? f.endDate || f.date : '',
      schedule: enabled && f.schedule.length === 0 && f.date
        ? [{ date: f.date, startTime: f.time || '09:00', endTime: f.endTime || '17:00', label: '' }]
        : f.schedule,
    }));
  };

  const addScheduleDay = () => {
    const lastDay = form.schedule[form.schedule.length - 1];
    const nextDate = lastDay?.date
      ? new Date(new Date(lastDay.date).getTime() + 86400000).toISOString().split('T')[0]
      : form.date || new Date().toISOString().split('T')[0];
    setForm(f => ({
      ...f,
      schedule: [...f.schedule, { date: nextDate, startTime: '09:00', endTime: '17:00', label: '' }],
      endDate: nextDate,
    }));
  };

  const updateScheduleDay = (index: number, updates: Partial<EventScheduleDay>) => {
    setForm(f => {
      const newSchedule = f.schedule.map((day, i) => i === index ? { ...day, ...updates } : day);
      // Auto-update endDate to the latest date in the schedule
      const dates = newSchedule.map(d => d.date).filter(Boolean).sort();
      return {
        ...f,
        schedule: newSchedule,
        date: dates[0] || f.date,
        endDate: dates[dates.length - 1] || f.endDate,
      };
    });
  };

  const removeScheduleDay = (index: number) => {
    setForm(f => {
      const newSchedule = f.schedule.filter((_, i) => i !== index);
      const dates = newSchedule.map(d => d.date).filter(Boolean).sort();
      return {
        ...f,
        schedule: newSchedule,
        date: dates[0] || f.date,
        endDate: dates[dates.length - 1] || f.endDate,
      };
    });
  };

  // Form Builder Helpers
  const addField = () => {
    const newField: FormField = { id: `field_${Date.now()}`, type: 'text', label: '', required: true };
    setForm(f => ({ ...f, formFields: [...(f.formFields || []), newField] }));
  };
  const updateField = (id: string, updates: Partial<FormField>) => {
    setForm(f => ({
      ...f,
      formFields: (f.formFields || []).map(field => field.id === id ? { ...field, ...updates } : field)
    }));
  };
  const removeField = (id: string) => {
    setForm(f => ({ ...f, formFields: (f.formFields || []).filter(field => field.id !== id) }));
  };
  const addFieldOption = (fieldId: string) => {
    setForm(f => ({
      ...f,
      formFields: (f.formFields || []).map(field => {
        if (field.id === fieldId) {
          const opts = field.options || [];
          return { ...field, options: [...opts, { id: `opt_${Date.now()}`, label: `Option ${opts.length + 1}` }] };
        }
        return field;
      })
    }));
  };
  const updateFieldOption = (fieldId: string, optId: string, label: string) => {
    setForm(f => ({
      ...f,
      formFields: (f.formFields || []).map(field => {
        if (field.id === fieldId) {
          return { ...field, options: (field.options || []).map(o => o.id === optId ? { ...o, label } : o) };
        }
        return field;
      })
    }));
  };
  const removeFieldOption = (fieldId: string, optId: string) => {
    setForm(f => ({
      ...f,
      formFields: (f.formFields || []).map(field => {
        if (field.id === fieldId) {
          return { ...field, options: (field.options || []).filter(o => o.id !== optId) };
        }
        return field;
      })
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">Manage upcoming events and registration forms</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Create Event
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((event) => (
          <Card key={event.id} className="border-border/50 hover:shadow-md transition-shadow group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-[10px] ${categoryColors[event.category] || 'bg-muted text-muted-foreground'}`}>
                      {event.category}
                    </Badge>
                    {event.recurring && <Badge variant="outline" className="text-[10px]">Recurring</Badge>}
                  </div>
                  <h3 className="text-base font-semibold leading-tight">{event.title}</h3>
                  {/* Audience tags */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {(event.targetCampuses ?? ['all']).includes('all') ? (
                      <Badge variant="outline" className="text-[9px] gap-0.5 border-amber-500/30 text-amber-600">
                        <Globe className="w-2.5 h-2.5" /> All
                      </Badge>
                    ) : (
                      (event.targetCampuses ?? []).map(id => (
                        <Badge key={id} variant="outline" className="text-[9px] gap-0.5 border-blue-500/30 text-blue-600">
                          <Building2 className="w-2.5 h-2.5" /> {campuses.find(c => c.id === id)?.name || id}
                        </Badge>
                      ))
                    )}
                    {!(event.targetGroups ?? ['all']).includes('all') && (
                      (event.targetGroups ?? []).map(g => (
                        <Badge key={g} variant="outline" className="text-[9px] gap-0.5 border-purple-500/30 text-purple-600">
                          <Users className="w-2.5 h-2.5" /> {g}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setSelectedEventForResponses(event)} title="View Responses">
                    <ListEnd className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(event)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(event)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {event.isMultiDay ? (
                    <span>
                      {formatDateShort(event.date)} – {formatDateShort(event.endDate || event.date)}
                      <Badge variant="outline" className="ml-2 text-[9px]"> {(event.schedule || []).length} days</Badge>
                    </span>
                  ) : (
                    <span>{formatDateShort(event.date)}</span>
                  )}
                </div>
                {!event.isMultiDay && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{formatTime(event.time)} – {formatTime(event.endTime)}</span>
                  </div>
                )}
                {event.isMultiDay && (event.schedule || []).length > 0 && (
                  <div className="pl-5 space-y-0.5">
                    {(event.schedule || []).slice(0, 3).map((day, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateShort(day.date)}: {formatTime(day.startTime)} – {formatTime(day.endTime)}</span>
                        {day.label && <span className="text-primary/70">({day.label})</span>}
                      </div>
                    ))}
                    {(event.schedule || []).length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{(event.schedule || []).length - 3} more days</span>
                    )}
                  </div>
                )}
                {event.recurring && event.nextOccurrence && (
                  <div className="flex items-center gap-2 text-violet-500">
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Next: {new Date(event.nextOccurrence).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {event.mapUrl ? (
                    <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                      {event.location}
                    </a>
                  ) : (
                    <span>{event.location}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span>{event.registered} registered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No events found</p>
          <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
            <Plus className="w-4 h-4" /> Create your first event
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event' : 'Create Event'}</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-8 py-2">
            
            {/* Left Column: Basic Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the event..." rows={3} />
              </div>
                <div className="col-span-2 space-y-2">
                  <Label>{form.isMultiDay ? 'Start Date *' : 'Date *'}</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>

              {/* Multi-day toggle */}
              <div className="flex items-center gap-3 py-1">
                <Switch checked={form.isMultiDay} onCheckedChange={toggleMultiDay} />
                <Label>Multi-day event</Label>
              </div>

              {!form.isMultiDay ? (
                /* Single-day: simple start/end time */
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time *</Label>
                    <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                  </div>
                </div>
              ) : (
                /* Multi-day: schedule builder */
                <div className="border border-border/50 rounded-xl p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Day-by-Day Schedule
                    </h4>
                    <Button type="button" variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={addScheduleDay}>
                      <Plus className="w-3 h-3" /> Add Day
                    </Button>
                  </div>
                  {form.schedule.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No days added yet. Click "Add Day" to build your schedule.</p>
                  )}
                  <div className="space-y-2">
                    {form.schedule.map((day, index) => (
                      <div key={index} className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-background border border-border/30">
                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Day {index + 1}</Label>
                          <Input
                            type="date"
                            value={day.date}
                            onChange={(e) => updateScheduleDay(index, { date: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Label (optional)</Label>
                          <Input
                            value={day.label || ''}
                            onChange={(e) => updateScheduleDay(index, { label: e.target.value })}
                            placeholder="e.g. Opening Day"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-1 space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Start Time</Label>
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => updateScheduleDay(index, { startTime: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-1 space-y-1">
                          <Label className="text-[10px] text-muted-foreground">End Time</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={day.endTime}
                              onChange={(e) => updateScheduleDay(index, { endTime: e.target.value })}
                              className="h-8 text-xs flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                              onClick={() => removeScheduleDay(index)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Grace Central" />
                </div>
                <div className="space-y-2">
                  <Label>Location Google Map URL (optional)</Label>
                  <Input value={form.mapUrl || ''} onChange={(e) => setForm({ ...form, mapUrl: e.target.value })} placeholder="e.g. https://maps.app.goo.gl/..." />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Registration Limit (Capacity)</Label>
                <Input type="number" min="0" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} placeholder="e.g. 100 (0 for unlimited)" />
                <p className="text-[10px] text-muted-foreground">Set to 0 if there is no limit to how many people can register.</p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Switch checked={form.recurring} onCheckedChange={(c) => setForm({ ...form, recurring: c })} />
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-violet-500" />
                    Recurring Event
                  </Label>
                  <p className="text-[10px] text-muted-foreground">Automatically schedule and notify users for repeated events</p>
                </div>
              </div>

              {form.recurring && (
                <div className="border border-violet-500/20 bg-violet-500/5 rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Pattern</Label>
                      <Select
                        value={form.recurrencePattern}
                        onValueChange={(v: any) => setForm({ ...form, recurrencePattern: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Every Week</SelectItem>
                          <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                          <SelectItem value="monthly">Every Month</SelectItem>
                          <SelectItem value="custom_monthly">Custom Monthly (e.g. 2nd Thursday)</SelectItem>
                          <SelectItem value="custom">Custom Notes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {form.recurrencePattern === 'custom_monthly' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Week of Month</Label>
                          <Select value={form.recurrenceWeekOfMonth} onValueChange={(v) => setForm({ ...form, recurrenceWeekOfMonth: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1st">First</SelectItem>
                              <SelectItem value="2nd">Second</SelectItem>
                              <SelectItem value="3rd">Third</SelectItem>
                              <SelectItem value="4th">Fourth</SelectItem>
                              <SelectItem value="last">Last</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Day of Week</Label>
                          <Select value={form.recurrenceDay} onValueChange={(v) => setForm({ ...form, recurrenceDay: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {(form.recurrencePattern === 'weekly' || form.recurrencePattern === 'biweekly') && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Day</Label>
                        <Select
                          value={form.recurrenceDay}
                          onValueChange={(v) => setForm({ ...form, recurrenceDay: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  {form.recurrencePattern === 'custom' && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Custom Schedule Note</Label>
                      <Input
                        value={form.recurrenceNote}
                        onChange={(e) => setForm({ ...form, recurrenceNote: e.target.value })}
                        placeholder="e.g. Every 1st and 3rd Sunday, Last Friday of month"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Recurring Until (optional)</Label>
                    <Input
                      type="date"
                      value={form.recurrenceEndDate}
                      onChange={(e) => setForm({ ...form, recurrenceEndDate: e.target.value })}
                    />
                    <p className="text-[10px] text-muted-foreground">Leave empty for indefinite recurring</p>
                  </div>
                </div>
              )}


              {/* Audience Targeting */}
              <div className="border-t border-border/50 pt-4 space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" /> Audience Targeting
                </h4>
                {/* Campus */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Broadcast to Campuses</Label>
                  {isCampusLeader && (
                    <p className="text-[10px] text-amber-500">Campus Leader: restricted to {campuses.find(c => c.id === currentUser.campusId)?.name}</p>
                  )}
                  {isGroupLeader && (
                    <p className="text-[10px] text-emerald-500">Group Leader: restricted to {campuses.find(c => c.id === currentUser.campusId)?.name}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={isAllCampuses} onCheckedChange={() => toggleCampusMode(true)} disabled={isCampusLeader || isGroupLeader} /> All
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={!isAllCampuses} onCheckedChange={() => toggleCampusMode(false)} disabled={isCampusLeader || isGroupLeader} /> Specific
                    </label>
                  </div>
                  {!isAllCampuses && (
                    <div className="grid grid-cols-1 gap-1.5 pl-2">
                      {campuses.map(c => (
                        <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={form.targetCampuses.includes(c.id)}
                            onCheckedChange={() => toggleCampus(c.id)}
                            disabled={(isCampusLeader || isGroupLeader) && c.id !== currentUser.campusId}
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {/* Groups */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Visible to Groups</Label>
                  {isGroupLeader && (
                    <p className="text-[10px] text-emerald-500">Group Leader: restricted to your assigned groups</p>
                  )}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={isAllGroups} onCheckedChange={() => toggleGroupMode(true)} disabled={isGroupLeader} /> All
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={!isAllGroups} onCheckedChange={() => toggleGroupMode(false)} disabled={isGroupLeader} /> Specific
                    </label>
                  </div>
                  {!isAllGroups && (
                    <div className="grid grid-cols-2 gap-1.5 pl-2">
                      {(() => {
                        // Filter groups based on selected campuses
                        const selectedCampusIds = isAllCampuses ? ['global'] : form.targetCampuses;
                        const visibleGroups = isAllCampuses
                          ? groups
                          : [...new Set(selectedCampusIds.flatMap(cid => getGroupsForCampus(groupScopes, cid)))];
                        return visibleGroups.map(g => (
                          <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox 
                              checked={form.targetGroups.includes(g)} 
                              onCheckedChange={() => toggleGroup(g)} 
                              disabled={isGroupLeader && !currentUser.groups.includes(g)}
                            />
                            {g}
                          </label>
                        ));
                      })()}
                    </div>
                  )}
                </div>
                {/* Preview */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Audience Preview</p>
                  <p className="text-xs">
                    {isAllCampuses ? '🌐 All Campuses' : `🏢 ${form.targetCampuses.map(id => campuses.find(c => c.id === id)?.name || id).join(', ') || 'None'}`}
                    {' · '}
                    {isAllGroups ? '👥 All Groups' : `👤 ${form.targetGroups.join(', ') || 'None'}`}
                  </p>
                </div>
              </div>

              {/* Google Photos Album */}
              <div className="border-t border-border/50 pt-4 space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Event Photo Album
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.googlePhotosUrl}
                    onChange={(e) => setForm({ ...form, googlePhotosUrl: e.target.value })}
                    placeholder="https://photos.app.goo.gl/..."
                    className="pl-9"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Paste a public Google Photos album URL. Members will see a 5-photo preview on the event card.</p>
              </div>
            </div>

            {/* Right Column: Form Builder */}
            <div className="border-l border-border/50 pl-8 space-y-6">
              <div>
                <h4 className="font-bold flex items-center gap-2">
                  <ListPlus className="w-4 h-4 text-primary" />
                  Custom Registration Form
                </h4>
                <p className="text-xs text-muted-foreground mt-1">Design a poll or questionnaire for attendees answering your RSVP.</p>
              </div>

              <div className="space-y-6">
                {(form.formFields || []).map((field, index) => (
                  <div key={field.id} className="p-4 bg-muted/30 rounded-xl relative group border border-border/30">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeField(field.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Input 
                          placeholder={`Question ${index + 1}`} 
                          value={field.label} 
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="font-medium bg-background"
                        />
                        <Select value={field.type} onValueChange={(v: FormFieldType) => updateField(field.id, { type: v })}>
                          <SelectTrigger className="w-[140px] bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text"><span className="flex items-center gap-2"><AlignLeft className="w-3 h-3"/> Short Answer</span></SelectItem>
                            <SelectItem value="textarea"><span className="flex items-center gap-2"><AlignLeft className="w-3 h-3"/> Paragraph</span></SelectItem>
                            <SelectItem value="radio"><span className="flex items-center gap-2"><Checkbox className="w-3 h-3 rounded-full border-muted-foreground"/> Multiple Choice</span></SelectItem>
                            <SelectItem value="checkbox"><span className="flex items-center gap-2"><CheckSquare className="w-3 h-3"/> Checkboxes</span></SelectItem>
                            <SelectItem value="select"><span className="flex items-center gap-2"><ChevronDown className="w-3 h-3"/> Dropdown</span></SelectItem>
                            <SelectItem value="date"><span className="flex items-center gap-2"><Calendar className="w-3 h-3"/> Date</span></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Options Builder for Choice types */}
                      {['radio', 'checkbox', 'select'].includes(field.type) && (
                        <div className="pl-2 space-y-2 mt-3 border-l-2 border-primary/20">
                          {(field.options || []).map((opt, optIdx) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              {field.type === 'radio' && <div className="w-3 h-3 rounded-full border border-muted-foreground shrink-0" />}
                              {field.type === 'checkbox' && <div className="w-3 h-3 rounded border border-muted-foreground shrink-0" />}
                              {field.type === 'select' && <span className="text-xs text-muted-foreground shrink-0">{optIdx + 1}.</span>}
                              <Input 
                                value={opt.label} 
                                onChange={(e) => updateFieldOption(field.id, opt.id, e.target.value)}
                                className="h-7 text-sm bg-background"
                              />
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeFieldOption(field.id, opt.id)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                          <div className="pt-1">
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => addFieldOption(field.id)}>
                              <Plus className="w-3 h-3" /> Add Option
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full gap-2 border-dashed" onClick={addField}>
                <Plus className="w-4 h-4" /> Add Form Field
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.title || !form.date || !form.time}>
              {editingId ? 'Save Changes' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single Event Confirm */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>Delete Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Series Update/Delete Confirm */}
      <Dialog open={!!updateSeriesConfirm} onOpenChange={(open) => !open && setUpdateSeriesConfirm(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Recurring Event Series</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm">This is a recurring event. Do you want to apply this change to just this specific event, or all upcoming events in the series?</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => confirmSubmitSeries(false)}>
                Just this occurrence
              </Button>
              <Button variant={updateSeriesConfirm?.action === 'delete' ? 'destructive' : 'default'} onClick={() => confirmSubmitSeries(true)}>
                All upcoming events in series
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Responses Confirm */}
      {selectedEventForResponses && (
        <Dialog open={true} onOpenChange={(open) => !open && setSelectedEventForResponses(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ListEnd className="w-5 h-5 text-primary" />
                Responses for {selectedEventForResponses.title}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-6">
              {(() => {
                const regs = getEventRegistrations(selectedEventForResponses.id);
                if (regs.length === 0) {
                  return (
                    <div className="text-center py-12 text-muted-foreground">
                      <ListEnd className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No responses recorded yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    <div className="flex gap-4 items-center p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Total Responses</p>
                        <p className="text-2xl font-bold">{regs.length}</p>
                      </div>
                      <Button variant="outline" className="gap-2 shrink-0">
                        <Download className="w-4 h-4" /> Export CSV
                      </Button>
                    </div>

                    <div className="border rounded-xl divide-y">
                      {regs.map(reg => (
                        <div key={reg.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{reg.userName}</p>
                              <p className="text-xs text-muted-foreground">{reg.userEmail} · {new Date(reg.registeredAt).toLocaleString()}</p>
                            </div>
                          </div>
                          {Object.keys(reg.responses).length > 0 && (
                            <div className="bg-muted/30 p-3 rounded-md space-y-2">
                              {selectedEventForResponses.formFields?.map(field => {
                                const answer = reg.responses[field.id];
                                if (!answer) return null;
                                return (
                                  <div key={field.id} className="text-sm">
                                    <span className="font-medium text-muted-foreground">{field.label}: </span>
                                    <span>{Array.isArray(answer) ? answer.join(', ') : answer}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
