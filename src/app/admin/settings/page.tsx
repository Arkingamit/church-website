"use client";

import React, { useState } from 'react';
import {
  useAdminData,
  canManageCampusesAndGroups,
  type Campus,
} from '@/lib/admin-data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Building2,
  Users,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Church,
  Tag,
} from 'lucide-react';

export default function SettingsPage() {
  const { campuses, groups, currentUser, addCampus, updateCampus, deleteCampus, addGroup, deleteGroup, users } = useAdminData();

  // Campus form state
  const [campusDialogOpen, setCampusDialogOpen] = useState(false);
  const [editingCampusId, setEditingCampusId] = useState<string | null>(null);
  const [campusForm, setCampusForm] = useState({ name: '', pastor: '' });
  const [deleteCampusConfirm, setDeleteCampusConfirm] = useState<string | null>(null);

  // Group form state
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState('');
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState<string | null>(null);

  if (!canManageCampusesAndGroups(currentUser.role)) {
    return (
      <div className="text-center py-16">
        <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-lg font-semibold">Super Admin Access Required</p>
        <p className="text-muted-foreground mt-1">Only Super Admins can manage campuses and groups.</p>
      </div>
    );
  }

  // Campus handlers
  const openCreateCampus = () => {
    setEditingCampusId(null);
    setCampusForm({ name: '', pastor: '' });
    setCampusDialogOpen(true);
  };

  const openEditCampus = (campus: Campus) => {
    setEditingCampusId(campus.id);
    setCampusForm({ name: campus.name, pastor: campus.pastor });
    setCampusDialogOpen(true);
  };

  const handleCampusSubmit = () => {
    if (!campusForm.name) return;
    if (editingCampusId) {
      updateCampus(editingCampusId, campusForm);
    } else {
      addCampus(campusForm);
    }
    setCampusDialogOpen(false);
    setCampusForm({ name: '', pastor: '' });
    setEditingCampusId(null);
  };

  const handleDeleteCampus = (id: string) => {
    deleteCampus(id);
    setDeleteCampusConfirm(null);
  };

  const handleAddGroup = () => {
    if (!newGroup.trim()) return;
    addGroup(newGroup.trim());
    setNewGroup('');
    setGroupDialogOpen(false);
  };

  const handleDeleteGroup = (name: string) => {
    deleteGroup(name);
    setDeleteGroupConfirm(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage campuses and groups</p>
      </div>

      {/* Campus Management */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Campus Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{campuses.length} campuses</p>
          </div>
          <Button onClick={openCreateCampus} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Campus
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {campuses.map(campus => {
            const memberCount = users.filter(u => u.campusId === campus.id).length;
            const leaderCount = users.filter(u => u.campusId === campus.id && (u.role === 'campus_leader' || u.role === 'admin')).length;
            return (
              <div
                key={campus.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Church className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{campus.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>Led by {campus.pastor}</span>
                    <span>·</span>
                    <span>{memberCount} users</span>
                    <span>·</span>
                    <span>{leaderCount} leaders</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">{campus.id}</Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCampus(campus)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteCampusConfirm(campus.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Group Management */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Group Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{groups.length} groups</p>
          </div>
          <Button onClick={() => setGroupDialogOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Group
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {groups.map(group => {
              const memberCount = users.filter(u => u.groups.includes(group)).length;
              return (
                <div
                  key={group}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group/item"
                >
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-medium">{group}</span>
                  <Badge variant="outline" className="text-[9px]">{memberCount}</Badge>
                  <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => setDeleteGroupConfirm(group)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Campus Create/Edit Dialog */}
      <Dialog open={campusDialogOpen} onOpenChange={setCampusDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingCampusId ? 'Edit Campus' : 'New Campus'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Campus Name *</Label>
              <Input value={campusForm.name} onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })} placeholder="e.g. South Campus" />
            </div>
            <div className="space-y-2">
              <Label>Pastor / Leader</Label>
              <Input value={campusForm.pastor} onChange={(e) => setCampusForm({ ...campusForm, pastor: e.target.value })} placeholder="e.g. Pastor David" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCampusSubmit} disabled={!campusForm.name}>
              {editingCampusId ? 'Save' : 'Create Campus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Create Dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Group</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Group Name *</Label>
            <Input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="e.g. College Students"
              onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGroup} disabled={!newGroup.trim()}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Campus Confirm */}
      <Dialog open={deleteCampusConfirm !== null} onOpenChange={() => setDeleteCampusConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Campus?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Users assigned to this campus won&#39;t be deleted but will need reassignment.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCampusConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteCampusConfirm && handleDeleteCampus(deleteCampusConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirm */}
      <Dialog open={deleteGroupConfirm !== null} onOpenChange={() => setDeleteGroupConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Group?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Members will be removed from this group.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGroupConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteGroupConfirm && handleDeleteGroup(deleteGroupConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
