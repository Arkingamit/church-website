"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MapPin, Plus, Trash2, Users, RefreshCw, Repeat, Calendar } from 'lucide-react';
import { SchedulePreviewExport } from '@/components/admin/schedule-preview-export';
import { useAdminData } from '@/lib/admin-data-context';
import { toast } from 'sonner';

export default function AdminAttendancePage() {
  const { campuses, currentUser } = useAdminData();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recordsDialogOpen, setRecordsDialogOpen] = useState(false);
  const [selectedSessionRecords, setSelectedSessionRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [form, setForm] = useState({
    title: '',
    campusId: currentUser?.campusId || 'main',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    latitude: 0,
    longitude: 0,
    radius: 500,
    recurring: false,
    recurrencePattern: 'weekly',
    recurrenceDay: 'Sunday',
    recurrenceWeekOfMonth: '1st',
    recurrenceEndDate: '',
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/attendance-sessions');
      if (res.ok) {
        setSessions(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/attendance-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success("Attendance session created");
        setDialogOpen(false);
        fetchSessions();
      } else {
        toast.error("Failed to create session");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      const res = await fetch(`/api/admin/attendance-sessions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Session deleted");
        fetchSessions();
      } else {
        toast.error("Failed to delete");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const viewRecords = async (sessionId: string) => {
    setRecordsDialogOpen(true);
    setLoadingRecords(true);
    try {
      const res = await fetch(`/api/admin/attendance-records?sessionId=${sessionId}`);
      if (res.ok) {
        setSelectedSessionRecords(await res.json());
      }
    } catch (e) {
      toast.error("Failed to load records");
    }
    setLoadingRecords(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm({
          ...form,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        toast.success("Location updated");
      },
      (error) => {
        toast.error("Failed to get location. Please ensure location services are enabled.");
      }
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1A202C]">Attendance Tracking</h1>
          <p className="text-muted-foreground mt-1">Configure geolocation attendance sessions</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#8B2323] hover:bg-[#721515]">
          <Plus className="w-4 h-4 mr-2" />
          Create Session
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : sessions.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Sessions</h3>
          <p className="text-muted-foreground mb-4">Create an attendance session to allow members to check in.</p>
          <Button onClick={() => setDialogOpen(true)} variant="outline">Create Session</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map(s => (
            <Card key={s._id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {s.title}
                      {s.recurring && <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Repeat className="w-3 h-3"/> Recurring</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {s.recurring ? `Starts ${s.date}` : s.date} • {s.startTime} - {s.endTime}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Radius:</span>
                    <span className="font-medium">{s.radius} meters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinates:</span>
                    <span className="font-medium truncate max-w-[120px]">{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" className="flex-1" onClick={() => viewRecords(s._id)}>
                    <Users className="w-4 h-4 mr-2" /> Records
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3" onClick={() => handleDelete(s._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Attendance Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Session Title</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Sunday Service - Main Campus" />
            </div>
            {currentUser?.role !== 'campus_leader' && (
              <div className="space-y-2">
                <Label>Campus</Label>
                <Select value={form.campusId} onValueChange={(val) => setForm({...form, campusId: val})}>
                  <SelectTrigger><SelectValue placeholder="Select a campus" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campuses</SelectItem>
                    {campuses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{form.recurring ? 'Start Date' : 'Date'}</Label>
                <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Radius (meters)</Label>
                <Input type="number" value={form.radius} onChange={e => setForm({...form, radius: parseInt(e.target.value) || 500})} />
              </div>
            </div>

            <div className="flex items-center gap-3 py-1">
              <Switch checked={form.recurring} onCheckedChange={(c) => setForm({...form, recurring: c})} />
              <Label>Recurring Session</Label>
            </div>

            {form.recurring && (
              <div className="border border-violet-500/20 bg-violet-500/5 rounded-xl p-4 space-y-4">
                <div className="text-xs text-muted-foreground bg-violet-500/10 p-2 rounded-md flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Recurring sequence is based on the Session Start Date: <span className="font-semibold text-foreground">{form.date || <span className="text-red-500 italic">Not set</span>}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Pattern</Label>
                    <Select value={form.recurrencePattern} onValueChange={(v) => setForm({...form, recurrencePattern: v})}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Every Week</SelectItem>
                        <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                        <SelectItem value="monthly">Every Month</SelectItem>
                        <SelectItem value="custom_monthly">Custom Monthly (e.g. 1st Sunday)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(form.recurrencePattern === 'weekly' || form.recurrencePattern === 'biweekly' || form.recurrencePattern === 'custom_monthly') && (
                    <div className="space-y-2">
                      <Label className="text-xs">Day of Week</Label>
                      <Select value={form.recurrenceDay} onValueChange={(v) => setForm({...form, recurrenceDay: v})}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {form.recurrencePattern === 'custom_monthly' && (
                    <div className="space-y-2">
                      <Label className="text-xs">Week of Month</Label>
                      <Select value={form.recurrenceWeekOfMonth} onValueChange={(v) => setForm({...form, recurrenceWeekOfMonth: v})}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st">First</SelectItem>
                          <SelectItem value="2nd">Second</SelectItem>
                          <SelectItem value="3rd">Third</SelectItem>
                          <SelectItem value="4th">Fourth</SelectItem>
                          <SelectItem value="last">Last</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                {/* Note removed */}
                <div className="space-y-2">
                  <Label className="text-xs">Until (Optional)</Label>
                  <Input type="date" className="h-8 text-xs" value={form.recurrenceEndDate} onChange={e => setForm({...form, recurrenceEndDate: e.target.value})} />
                </div>
                <div className="pt-2">
                  <SchedulePreviewExport
                    title={form.title || 'Untitled Session'}
                    startDate={form.date}
                    endDate={form.recurrenceEndDate}
                    pattern={form.recurrencePattern}
                    dayOfWeek={form.recurrenceDay}
                    weekOfMonth={form.recurrenceWeekOfMonth}
                    startTime={form.startTime}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-bold">Location Coordinates</Label>
                <Button size="sm" variant="secondary" onClick={getCurrentLocation}>
                  <MapPin className="w-3 h-3 mr-1" /> Use My Location
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Latitude</Label>
                  <Input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Longitude</Label>
                  <Input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">You can also copy/paste coordinates from Google Maps (Right-click a location to copy).</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#8B2323] hover:bg-[#721515]">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Records Dialog */}
      <Dialog open={recordsDialogOpen} onOpenChange={setRecordsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Attendance Records</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {loadingRecords ? (
              <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : selectedSessionRecords.length === 0 ? (
              <p className="text-center text-muted-foreground p-8">No members have checked in yet.</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-muted-foreground px-2 pb-2 border-b">
                  <span>MEMBER</span>
                  <span>DISTANCE / TIME</span>
                </div>
                {selectedSessionRecords.map(r => (
                  <div key={r._id} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-bold text-sm">{r.user.name}</p>
                      <p className="text-xs text-muted-foreground">{r.user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-green-600">{r.distance}m away</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
