"use client";

import React, { useState } from 'react';
import { useAdminData, canPublishAllCampuses, getGroupsForCampus, GalleryAlbum } from '@/lib/admin-data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Search,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  GripVertical,
  Megaphone,
  Globe,
  Building2,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function GalleryManagementPage() {
  const { galleryAlbums, addGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum, reorderGalleryAlbums, campuses, groups, groupScopes, currentUser } = useAdminData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [draggedItem, setDraggedItem] = useState<GalleryAlbum | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<GalleryAlbum, 'id'>>({
    title: '',
    description: '',
    url: '',
    category: 'Worship',
    targetCampuses: ['all'],
    targetGroups: ['all'],
  });

  const categories = ['Worship', 'Youth', 'Fellowship', 'Outreach', 'Baptism', 'Group', 'Event'];

  const isCampusLeader = currentUser.role === 'campus_leader';
  const isGroupLeader = currentUser.role === 'group_leader';

  // ── Audience helpers ──
  const isAllCampuses = (form.targetCampuses || ['all']).includes('all');
  const isAllGroups = (form.targetGroups || ['all']).includes('all');

  const toggleCampusMode = (all: boolean) => {
    if (isCampusLeader || isGroupLeader) return;
    setForm(f => ({ ...f, targetCampuses: all ? ['all'] : [] }));
  };

  const toggleCampus = (campusId: string) => {
    if (isCampusLeader || isGroupLeader) return;
    setForm(f => {
      const tc = f.targetCampuses || [];
      const has = tc.includes(campusId);
      const next = has
        ? tc.filter(c => c !== campusId)
        : [...tc.filter(c => c !== 'all'), campusId];
      return { ...f, targetCampuses: next.length === 0 ? ['all'] : next };
    });
  };

  const toggleGroupMode = (all: boolean) => {
    if (isGroupLeader) return;
    setForm(f => ({ ...f, targetGroups: all ? ['all'] : [] }));
  };

  const toggleGroup = (group: string) => {
    if (isGroupLeader) return;
    setForm(f => {
      const tg = f.targetGroups || [];
      const has = tg.includes(group);
      const next = has
        ? tg.filter(g => g !== group)
        : [...tg.filter(g => g !== 'all'), group];
      return { ...f, targetGroups: next.length === 0 ? ['all'] : next };
    });
  };

  const filteredAlbums = galleryAlbums.filter(album => {
    const matchesSearch = album.title.toLowerCase().includes(search.toLowerCase()) ||
      album.description.toLowerCase().includes(search.toLowerCase());

    // Group leaders only see albums targeted at their groups
    if (isGroupLeader) {
      const aGroups = album.targetGroups ?? ['all'];
      if (!aGroups.includes('all') && !aGroups.some(g => currentUser.groups.includes(g))) {
        return false;
      }
    }
    return matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      updateGalleryAlbum(editingId, form);
      setEditingId(null);
    } else {
      addGalleryAlbum(form);
      setIsAdding(false);
    }
    setForm({ title: '', description: '', url: '', category: 'Worship', targetCampuses: ['all'], targetGroups: ['all'] });
  };

  const handleEdit = (album: GalleryAlbum) => {
    setForm({
      title: album.title,
      description: album.description,
      url: album.url,
      category: album.category,
      targetCampuses: album.targetCampuses || ['all'],
      targetGroups: album.targetGroups || ['all'],
    });
    setEditingId(album.id);
    setIsAdding(true);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, album: GalleryAlbum) => {
    setDraggedItem(album);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetAlbum: GalleryAlbum) => {
    e.preventDefault();
    setDragOverId(null);
    if (!draggedItem || draggedItem.id === targetAlbum.id) return;

    const items = [...galleryAlbums].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const draggedIdx = items.findIndex(i => i.id === draggedItem.id);
    const targetIdx = items.findIndex(i => i.id === targetAlbum.id);

    items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, draggedItem);

    reorderGalleryAlbums(items);
    setDraggedItem(null);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Gallery Management</h1>
          <p className="text-muted-foreground italic">Manage church photo albums from Google Photos</p>
        </div>
        {!isAdding && (
          <Button onClick={() => {
            setForm({
              title: '', description: '', url: '', category: 'Worship',
              targetCampuses: (isCampusLeader || isGroupLeader) ? [currentUser.campusId] : ['all'],
              targetGroups: isGroupLeader ? currentUser.groups : ['all'],
            });
            setEditingId(null);
            setIsAdding(true);
          }} className="rounded-full px-6 hover-lift">
            <Plus className="w-4 h-4 mr-2" /> New Album
          </Button>
        )}
      </div>

      {isAdding ? (
        <Card className="glass-card border-0 overflow-hidden animate-in fade-in slide-in-from-top-4">
          <CardHeader className="border-b border-border/50 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl italic">{editingId ? 'Edit Album' : 'Create New Album'}</CardTitle>
                <CardDescription>Enter the Google Photos album details below</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingId(null); }} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider">Album Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Youth Camp 2024"
                    required
                    className="bg-background/50 border-border/50 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-bold uppercase tracking-wider">Category</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <Badge
                        key={cat}
                        variant={form.category === cat ? 'default' : 'glass'}
                        className="cursor-pointer px-4 py-1.5 rounded-full transition-all"
                        onClick={() => setForm({ ...form, category: cat })}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-bold uppercase tracking-wider">Google Photos URL</Label>
                <div className="relative">
                  <Input
                    id="url"
                    value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })}
                    placeholder="https://photos.app.goo.gl/..."
                    required
                    className="bg-background/50 border-border/50 focus:ring-primary/20 pl-10"
                  />
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground italic flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3 h-3" /> Make sure the album is shared and anyone with the link can view it.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Tell the story of these moments..."
                  className="bg-background/50 border-border/50 focus:ring-primary/20 min-h-[100px]"
                />
              </div>

              {/* ── Audience Targeting ── */}
              <div className="border-t border-border/50 pt-6 space-y-4">
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
                  {isGroupLeader && (
                    <p className="text-[10px] text-emerald-500">
                      As a Group Leader, you can only broadcast to your campus: {campuses.find(c => c.id === currentUser.campusId)?.name}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={isAllCampuses}
                        onCheckedChange={() => toggleCampusMode(true)}
                        disabled={isCampusLeader || isGroupLeader}
                      />
                      All Campuses
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={!isAllCampuses}
                        onCheckedChange={() => toggleCampusMode(false)}
                        disabled={isCampusLeader || isGroupLeader}
                      />
                      Specific
                    </label>
                  </div>
                  {!isAllCampuses && (
                    <div className="grid grid-cols-1 gap-1.5 pl-2">
                      {campuses.map(campus => (
                        <label key={campus.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={(form.targetCampuses || []).includes(campus.id)}
                            onCheckedChange={() => toggleCampus(campus.id)}
                            disabled={(isCampusLeader || isGroupLeader) && campus.id !== currentUser.campusId}
                          />
                          {campus.name}
                          {(isCampusLeader || isGroupLeader) && campus.id !== currentUser.campusId && (
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
                  {isGroupLeader && (
                    <p className="text-[10px] text-emerald-500">
                      As a Group Leader, you can only broadcast to your assigned groups.
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={isAllGroups} onCheckedChange={() => toggleGroupMode(true)} disabled={isGroupLeader} />
                      All Groups
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={!isAllGroups} onCheckedChange={() => toggleGroupMode(false)} disabled={isGroupLeader} />
                      Specific
                    </label>
                  </div>
                  {!isAllGroups && (
                    <div className="grid grid-cols-2 gap-1.5 pl-2">
                      {(() => {
                        const selectedCampusIds = isAllCampuses ? ['global'] : (form.targetCampuses || []);
                        const visibleGroups = isAllCampuses
                          ? groups
                          : [...new Set(selectedCampusIds.flatMap(cid => getGroupsForCampus(groupScopes, cid)))];
                        return visibleGroups.map(group => (
                          <label key={group} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={(form.targetGroups || []).includes(group)}
                              onCheckedChange={() => toggleGroup(group)}
                              disabled={isGroupLeader && !currentUser.groups.includes(group)}
                            />
                            {group}
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
                    {isAllCampuses ? '🌐 All Campuses' : `🏢 ${(form.targetCampuses || []).map(id => campuses.find(c => c.id === id)?.name || id).join(', ') || 'None selected'}`}
                    {' · '}
                    {isAllGroups ? '👥 All Groups' : `👤 ${(form.targetGroups || []).join(', ') || 'None selected'}`}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); }} className="rounded-full px-8 border-border/50">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full px-10 font-bold hover-lift">
                  <Save className="w-4 h-4 mr-2" /> {editingId ? 'Update Album' : 'Create Album'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex justify-end">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search albums..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((album) => (
              <Card 
                key={album.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, album)}
                onDragOver={(e) => handleDragOver(e, album.id)}
                onDrop={(e) => handleDrop(e, album)}
                onDragEnd={() => { setDraggedItem(null); setDragOverId(null); }}
                className={`glass-card border-2 overflow-hidden flex flex-col hover-lift group transition-all duration-500 ${
                  dragOverId === album.id ? 'border-primary scale-[1.02] shadow-xl' : 'border-transparent'
                } ${draggedItem?.id === album.id ? 'opacity-40 animate-pulse' : 'opacity-100'}`}
              >
                <div className="aspect-video relative bg-primary/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute top-4 right-4 z-20 cursor-move opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-black/50 rounded-lg text-white">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <ImageIcon className="w-12 h-12 text-primary/10 group-hover:scale-125 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-primary text-primary-foreground border-0">
                      {album.category}
                    </Badge>

                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white line-clamp-1 italic">{album.title}</h3>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 italic leading-relaxed">
                    {album.description || 'No description provided.'}
                  </p>

                  {/* Audience Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {(album.targetCampuses ?? ['all']).includes('all') ? (
                      <Badge variant="outline" className="text-[9px] gap-1 border-amber-500/30 text-amber-600">
                        <Globe className="w-2.5 h-2.5" /> All Campuses
                      </Badge>
                    ) : (
                      album.targetCampuses?.map(id => (
                        <Badge key={id} variant="outline" className="text-[9px] gap-1 border-blue-500/30 text-blue-600">
                          <Building2 className="w-2.5 h-2.5" /> {campuses.find(c => c.id === id)?.name || id}
                        </Badge>
                      ))
                    )}
                    {(album.targetGroups ?? ['all']).includes('all') ? (
                      <Badge variant="outline" className="text-[9px] gap-1 border-emerald-500/30 text-emerald-600">
                        <Users className="w-2.5 h-2.5" /> All Groups
                      </Badge>
                    ) : (
                      album.targetGroups?.map(g => (
                        <Badge key={g} variant="outline" className="text-[9px] gap-1 border-purple-500/30 text-purple-600">
                          <Users className="w-2.5 h-2.5" /> {g}
                        </Badge>
                      ))
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex gap-2">
                      <Button
                        variant="glass"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-primary/20 hover:text-primary transition-colors"
                        onClick={() => handleEdit(album)}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="glass"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => deleteGalleryAlbum(album.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <a href={album.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-9 group/btn px-2 hover:bg-transparent text-primary">
                        Link <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAlbums.length === 0 && (
              <div className="col-span-full text-center py-24 glass-card rounded-3xl border-0">
                <ImageIcon className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2 italic">No Albums Found</h3>
                <p className="text-muted-foreground mb-8">Ready to showcase your community moments?</p>
                <Button variant="outline" onClick={() => setIsAdding(true)} className="rounded-full px-8">
                  Add Your First Album
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
