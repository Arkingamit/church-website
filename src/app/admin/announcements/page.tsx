"use client";

import React, { useState } from 'react';
import { useAdminData, canPublishAllCampuses, type Announcement } from '@/lib/admin-data-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Megaphone,
  Pin,
  Plus,
  Pencil,
  Trash2,
  Search,
  Calendar,
  Heart,
  Globe,
  Building2,
  Users,
} from 'lucide-react';

const ANNOUNCEMENT_CATEGORIES = ['Worship', 'Youth', 'Outreach', 'Membership', 'Urgent'];

const categoryColors: Record<string, string> = {
  Worship: 'bg-primary/10 text-primary',
  Membership: 'bg-blue-500/10 text-blue-600',
  Youth: 'bg-emerald-500/10 text-emerald-600',
  Outreach: 'bg-amber-500/10 text-amber-600',
  Urgent: 'bg-rose-500/10 text-rose-600',
};

const emptyForm = {
  title: '',
  content: '',
  category: 'Worship',
  isPinned: false,
  date: new Date().toISOString().split('T')[0],
  author: '',
  image: null as string | null,
  reactions: 0,
  targetCampuses: ['all'] as string[],
  targetGroups: ['all'] as string[],
};

export default function AnnouncementsPage() {
  const { announcements, campuses, groups, addAnnouncement, updateAnnouncement, deleteAnnouncement, currentUser } = useAdminData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isCampusLeader = currentUser.role === 'campus_leader';

  const filtered = announcements.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase()) ||
    a.author.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      date: new Date().toISOString().split('T')[0],
      // Campus leaders: lock to their campus
      targetCampuses: isCampusLeader ? [currentUser.campusId] : ['all'],
      targetGroups: ['all'],
    });
    setDialogOpen(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setForm({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      isPinned: announcement.isPinned,
      date: announcement.date,
      author: announcement.author,
      image: announcement.image,
      reactions: announcement.reactions,
      targetCampuses: announcement.targetCampuses || ['all'],
      targetGroups: announcement.targetGroups || ['all'],
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.content) return;
    if (editingId !== null) {
      updateAnnouncement(editingId, form);
    } else {
      addAnnouncement(form);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteAnnouncement(id);
    setDeleteConfirmId(null);
  };

  // ── Audience helpers ──
  const isAllCampuses = form.targetCampuses.includes('all');
  const isAllGroups = form.targetGroups.includes('all');

  const toggleCampusMode = (all: boolean) => {
    if (isCampusLeader) return; // locked
    setForm(f => ({
      ...f,
      targetCampuses: all ? ['all'] : [],
    }));
  };

  const toggleCampus = (campusId: string) => {
    if (isCampusLeader) return;
    setForm(f => {
      const has = f.targetCampuses.includes(campusId);
      const next = has
        ? f.targetCampuses.filter(c => c !== campusId)
        : [...f.targetCampuses.filter(c => c !== 'all'), campusId];
      return { ...f, targetCampuses: next.length === 0 ? ['all'] : next };
    });
  };

  const toggleGroupMode = (all: boolean) => {
    setForm(f => ({ ...f, targetGroups: all ? ['all'] : [] }));
  };

  const toggleGroup = (group: string) => {
    setForm(f => {
      const has = f.targetGroups.includes(group);
      const next = has
        ? f.targetGroups.filter(g => g !== group)
        : [...f.targetGroups.filter(g => g !== 'all'), group];
      return { ...f, targetGroups: next.length === 0 ? ['all'] : next };
    });
  };

  const getAudienceLabel = (a: Announcement) => {
    const parts: string[] = [];
    if (a.targetCampuses?.includes('all')) {
      parts.push('All Campuses');
    } else if (a.targetCampuses?.length) {
      parts.push(a.targetCampuses.map(id => campuses.find(c => c.id === id)?.name || id).join(', '));
    }
    if (a.targetGroups?.includes('all')) {
      parts.push('All Groups');
    } else if (a.targetGroups?.length) {
      parts.push(a.targetGroups.join(', '));
    }
    return parts.join(' · ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground mt-1">Publish and manage church announcements</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((announcement) => (
          <Card key={announcement.id} className="border-border/50 hover:shadow-md transition-shadow group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {announcement.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-accent fill-current shrink-0" />
                    )}
                    <Badge className={`text-[10px] ${categoryColors[announcement.category] || 'bg-muted text-muted-foreground'}`}>
                      {announcement.category}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">{announcement.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>By {announcement.author}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(announcement.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{announcement.reactions}</span>
                    </div>
                  </div>
                  {/* Audience Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {announcement.targetCampuses?.includes('all') ? (
                      <Badge variant="outline" className="text-[9px] gap-1 border-amber-500/30 text-amber-600">
                        <Globe className="w-2.5 h-2.5" /> All Campuses
                      </Badge>
                    ) : (
                      announcement.targetCampuses?.map(id => (
                        <Badge key={id} variant="outline" className="text-[9px] gap-1 border-blue-500/30 text-blue-600">
                          <Building2 className="w-2.5 h-2.5" /> {campuses.find(c => c.id === id)?.name || id}
                        </Badge>
                      ))
                    )}
                    {announcement.targetGroups?.includes('all') ? (
                      <Badge variant="outline" className="text-[9px] gap-1 border-emerald-500/30 text-emerald-600">
                        <Users className="w-2.5 h-2.5" /> All Groups
                      </Badge>
                    ) : (
                      announcement.targetGroups?.map(g => (
                        <Badge key={g} variant="outline" className="text-[9px] gap-1 border-purple-500/30 text-purple-600">
                          <Users className="w-2.5 h-2.5" /> {g}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(announcement)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirmId(announcement.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{announcement.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No announcements found</p>
          <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
            <Plus className="w-4 h-4" /> Create your first announcement
          </Button>
        </div>
      )}

      {/* ── Create/Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="a-title">Title *</Label>
              <Input id="a-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-content">Content *</Label>
              <Textarea id="a-content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write the announcement content..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="a-category">Category</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANNOUNCEMENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-date">Date</Label>
                <Input id="a-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="a-author">Author</Label>
                <Input id="a-author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="e.g. Pastor Mark" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch id="a-pinned" checked={form.isPinned} onCheckedChange={(checked) => setForm({ ...form, isPinned: checked })} />
                <Label htmlFor="a-pinned">Pin announcement</Label>
              </div>
            </div>

            {/* ── Audience Targeting ── */}
            <div className="border-t border-border/50 pt-4 space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" />
                Audience Targeting
              </h4>

              {/* Campus Targeting */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Broadcast to Campuses</Label>
                {isCampusLeader && (
                  <p className="text-[10px] text-amber-500">
                    As a Campus Leader, you can only broadcast to your campus: {campuses.find(c => c.id === currentUser.campusId)?.name}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={isAllCampuses}
                      onCheckedChange={() => toggleCampusMode(true)}
                      disabled={isCampusLeader}
                    />
                    All Campuses
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={!isAllCampuses}
                      onCheckedChange={() => toggleCampusMode(false)}
                      disabled={isCampusLeader}
                    />
                    Specific
                  </label>
                </div>
                {!isAllCampuses && (
                  <div className="grid grid-cols-1 gap-1.5 pl-2">
                    {campuses.map(campus => (
                      <label key={campus.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={form.targetCampuses.includes(campus.id)}
                          onCheckedChange={() => toggleCampus(campus.id)}
                          disabled={isCampusLeader && campus.id !== currentUser.campusId}
                        />
                        {campus.name}
                        {isCampusLeader && campus.id !== currentUser.campusId && (
                          <span className="text-[10px] text-muted-foreground">(restricted)</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Group Targeting */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Visible to Groups</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={isAllGroups} onCheckedChange={() => toggleGroupMode(true)} />
                    All Groups
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={!isAllGroups} onCheckedChange={() => toggleGroupMode(false)} />
                    Specific
                  </label>
                </div>
                {!isAllGroups && (
                  <div className="grid grid-cols-2 gap-1.5 pl-2">
                    {groups.map(group => (
                      <label key={group} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={form.targetGroups.includes(group)}
                          onCheckedChange={() => toggleGroup(group)}
                        />
                        {group}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Audience Preview</p>
                <p className="text-xs">
                  {isAllCampuses ? '🌐 All Campuses' : `🏢 ${form.targetCampuses.map(id => campuses.find(c => c.id === id)?.name || id).join(', ') || 'None selected'}`}
                  {' · '}
                  {isAllGroups ? '👥 All Groups' : `👤 ${form.targetGroups.join(', ') || 'None selected'}`}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.title || !form.content}>
              {editingId ? 'Save Changes' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Announcement?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
