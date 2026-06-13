"use client";

import React, { useState } from 'react';
import {
  useAdminData,
  canManageUsers,
  canAppointRole,
  getAssignableRoles,
  getGroupsForCampus,
  ROLE_LABELS,
  type UserProfile,
  type UserRole,
} from '@/lib/admin-data-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Shield,
  ShieldCheck,
  User,
  Crown,
  Building2,
  UserPlus,
  UserCheck,
} from 'lucide-react';

const roleIcons: Record<UserRole, React.ElementType> = {
  member: User,
  group_leader: UserCheck,
  campus_leader: Shield,
  admin: ShieldCheck,
  super_admin: Crown,
};

const roleColors: Record<UserRole, string> = {
  member: 'bg-muted/50 text-muted-foreground',
  group_leader: 'bg-emerald-500/10 text-emerald-600',
  campus_leader: 'bg-blue-500/10 text-blue-600',
  admin: 'bg-amber-500/10 text-amber-600',
  super_admin: 'bg-purple-500/10 text-purple-600',
};

const emptyForm = {
  name: '',
  email: '',
  role: 'member' as UserRole,
  campusId: 'main',
  groups: [] as string[],
};

export default function UsersPage() {
  const { users, campuses, groupScopes, currentUser, addUser, updateUser, deleteUser } = useAdminData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  if (!canManageUsers(currentUser.role)) {
    return (
      <div className="text-center py-16">
        <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-lg font-semibold">Access Restricted</p>
        <p className="text-muted-foreground mt-1">You need Campus Leader access to manage users.</p>
      </div>
    );
  }

  const isCampusLeader = currentUser.role === 'campus_leader';
  const assignableRoles = getAssignableRoles(currentUser.role);

  const filtered = users.filter(u => {
    // Campus leaders only see users in their campus + global users
    if (isCampusLeader && u.campusId !== currentUser.campusId && u.campusId !== 'global') {
      return false;
    }
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ 
      ...emptyForm, 
      role: assignableRoles[0] || 'member',
      campusId: isCampusLeader ? currentUser.campusId : 'main',
    });
    setDialogOpen(true);
  };

  const openEdit = (user: UserProfile) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      campusId: user.campusId,
      groups: user.groups,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    if (editingId !== null) {
      updateUser(editingId, form);
    } else {
      addUser(form);
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) return; // Can't delete yourself
    deleteUser(id);
    setDeleteConfirmId(null);
  };

  const toggleGroup = (group: string) => {
    setForm(f => ({
      ...f,
      groups: f.groups.includes(group) ? f.groups.filter(g => g !== group) : [...f.groups, group],
    }));
  };

  // Stats
  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage users and assign roles</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(['super_admin', 'admin', 'campus_leader', 'group_leader', 'member'] as UserRole[]).map(role => {
          const Icon = roleIcons[role];
          return (
            <Card key={role} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${roleColors[role]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{roleCounts[role] || 0}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}s</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {(['super_admin', 'admin', 'campus_leader', 'group_leader', 'member'] as UserRole[]).map(r => (
              <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filtered.map(user => {
          const Icon = roleIcons[user.role];
          const campus = campuses.find(c => c.id === user.campusId);
          const canEdit = canAppointRole(currentUser.role, user.role) || user.id === currentUser.id;
          const canDelete = user.id !== currentUser.id && canAppointRole(currentUser.role, user.role);

          return (
            <Card key={user.id} className="border-border/50 hover:shadow-md transition-shadow group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${roleColors[user.role]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold truncate">{user.name}</p>
                    <Badge variant="outline" className={`text-[10px] ${roleColors[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                    {user.id === currentUser.id && (
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">You</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {user.campusId === 'global' ? 'Global' : (campus?.name || user.campusId)}
                    </span>
                    {user.groups.length > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {user.groups.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {canEdit && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirmId(user.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit User' : 'Add User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@grace.org" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map(r => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Campus</Label>
                <Select 
                  value={form.campusId} 
                  onValueChange={(v) => setForm({ ...form, campusId: v, groups: [] })} // Reset groups when campus changes
                  disabled={isCampusLeader}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (All Campuses)</SelectItem>
                    {campuses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {['member', 'group_leader'].includes(form.role) && (
              <div className="space-y-2">
                <Label>Groups</Label>
                {getGroupsForCampus(groupScopes, form.campusId).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No groups available for this campus.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {getGroupsForCampus(groupScopes, form.campusId).map(g => (
                      <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.groups.includes(g)}
                          onChange={() => toggleGroup(g)}
                          className="rounded"
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name || !form.email}>
              {editingId ? 'Save Changes' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete User?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will remove the user from the system.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
