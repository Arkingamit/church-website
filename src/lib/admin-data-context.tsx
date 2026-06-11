"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────
export type UserRole = 'member' | 'campus_leader' | 'admin' | 'super_admin';

export interface Campus {
  id: string;
  _id?: string;
  name: string;
  pastor: string;
}

export type FormFieldType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date';

export interface FormFieldOption {
  id: string;
  label: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options?: FormFieldOption[];
}

export interface Event {
  id: string;
  _id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  category: string;
  capacity: number;
  registered: number;
  image: string | null;
  recurring: boolean;
  host: string;
  targetCampuses: string[];
  targetGroups: string[];
  createdAt: string;
  googlePhotosUrl?: string;
  formFields?: FormField[];
}

export interface EventRegistration {
  id: string;
  _id?: string;
  eventId: string;
  userId?: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
  responses: Record<string, string | string[]>;
}

export interface Announcement {
  id: string;
  _id?: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  date: string;
  author: string;
  image: string | null;
  reactions: number;
  targetCampuses: string[];
  targetGroups: string[];
  createdAt: string;
}

export interface WorshipVideo {
  id: string;
  _id?: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  categories: string[];
  videoId: string;
}

export interface Sermon {
  id: string;
  _id?: string;
  seriesId: string;
  title: string;
  pastor: string;
  date: string;
  duration: string;
  videoId: string;
  description: string;
  category: string;
  views: number;
  likes: number;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface SermonSeries {
  id: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
}

export interface GalleryAlbum {
  id: string;
  _id?: string;
  title: string;
  description: string;
  url: string;
  category: string;
  coverImage?: string;
  sortOrder?: number;
}

export interface LiveStream {
  id?: string;
  _id?: string;
  campusId: string;
  videoId: string;
  isLive: boolean;
  title: string;
  description: string;
}

export interface UserProfile {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  campusId: string;
  groups: string[];
}

// ── Permissions ────────────────────────────────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  member: 'Member',
  campus_leader: 'Campus Leader',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  member: 0,
  campus_leader: 1,
  admin: 2,
  super_admin: 3,
};

export function canAccessAdmin(role: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.campus_leader;
}

export function canPublish(role: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.campus_leader;
}

export function canPublishAllCampuses(role: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin;
}

export function canManageUsers(role: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin;
}

export function canManageCampusesAndGroups(role: UserRole): boolean {
  return role === 'super_admin';
}

export function canAppointRole(appointerRole: UserRole, targetRole: UserRole): boolean {
  if (appointerRole === 'super_admin') return true;
  if (appointerRole === 'admin' && targetRole === 'campus_leader') return true;
  if (appointerRole === 'admin' && targetRole === 'member') return true;
  return false;
}

export function getAssignableRoles(role: UserRole): UserRole[] {
  if (role === 'super_admin') return ['member', 'campus_leader', 'admin', 'super_admin'];
  if (role === 'admin') return ['member', 'campus_leader'];
  return [];
}

// ── Default Groups (kept client-side for now) ──────────────────────────
const defaultGroups: string[] = [
  'Young Adults', 'Families', 'Men', 'Women',
  'Seniors', 'New Members', 'Couples', 'Youth',
];

const defaultCurrentUser: UserProfile = {
  id: '1', name: 'Super Admin', email: 'superadmin@grace.org',
  role: 'super_admin', campusId: 'main', groups: [],
};

// ── Helper: map _id to id ──────────────────────────────────────────────
function mapId<T extends { _id?: string }>(item: T): T & { id: string } {
  return { ...item, id: item._id || (item as any).id || '' };
}

function mapIds<T extends { _id?: string }>(items: T[]): (T & { id: string })[] {
  return items.map(mapId);
}

// ── Context ────────────────────────────────────────────────────────────
interface AdminDataContextType {
  // Data
  campuses: Campus[];
  groups: string[];
  events: Event[];
  eventRegistrations: EventRegistration[];
  announcements: Announcement[];
  users: UserProfile[];
  worshipVideos: WorshipVideo[];
  sermons: Sermon[];
  sermonSeries: SermonSeries[];
  currentUser: UserProfile;
  galleryAlbumUrl: string;
  galleryAlbums: GalleryAlbum[];
  liveStreams: LiveStream[];

  // Setters
  setCurrentUser: (user: UserProfile) => void;
  setGalleryAlbumUrl: (url: string) => void;

  // Live Streams CRUD
  updateLiveStream: (campusId: string, updates: Partial<LiveStream>) => void;

  // Gallery CRUD
  addGalleryAlbum: (album: Omit<GalleryAlbum, 'id'>) => void;
  updateGalleryAlbum: (id: string, album: Partial<GalleryAlbum>) => void;
  deleteGalleryAlbum: (id: string) => void;
  reorderGalleryAlbums: (albums: GalleryAlbum[]) => void;

  // Events CRUD
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  addEventRegistration: (reg: Omit<EventRegistration, 'id' | 'registeredAt'>) => void;
  getEventRegistrations: (eventId: string) => EventRegistration[];

  // Announcements CRUD
  addAnnouncement: (a: Omit<Announcement, 'id' | 'createdAt'>) => void;
  updateAnnouncement: (id: string, a: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  // Users CRUD
  addUser: (user: Omit<UserProfile, 'id'>) => void;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;

  // Worship Videos CRUD
  addWorshipVideo: (video: Omit<WorshipVideo, 'id'>) => void;
  updateWorshipVideo: (id: string, video: Partial<WorshipVideo>) => void;
  deleteWorshipVideo: (id: string) => void;

  // Sermons CRUD
  addSermon: (sermon: Omit<Sermon, 'id' | 'views' | 'likes'>) => void;
  updateSermon: (id: string, sermon: Partial<Sermon>) => void;
  deleteSermon: (id: string) => void;
  reorderSermons: (sermons: Sermon[]) => void;

  // Sermon Series CRUD
  addSermonSeries: (series: Omit<SermonSeries, 'id'>) => void;
  updateSermonSeries: (id: string, series: Partial<SermonSeries>) => void;
  deleteSermonSeries: (id: string) => void;

  // Campuses & Groups CRUD
  addCampus: (campus: Omit<Campus, 'id'>) => void;
  updateCampus: (id: string, updates: Partial<Campus>) => void;
  deleteCampus: (id: string) => void;
  addGroup: (name: string) => void;
  deleteGroup: (name: string) => void;

  // Filtering
  getVisibleAnnouncements: (campusId: string, groups: string[]) => Announcement[];
  getVisibleEvents: (campusId: string, groups: string[]) => Event[];
}

const AdminDataContext = createContext<AdminDataContextType | null>(null);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [groups, setGroups] = useState<string[]>(defaultGroups);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [worshipVideos, setWorshipVideos] = useState<WorshipVideo[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [sermonSeries, setSermonSeriesState] = useState<SermonSeries[]>([]);
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [currentUser, setCurrentUserState] = useState<UserProfile>(defaultCurrentUser);
  const [galleryAlbumUrl, setGalleryAlbumUrlState] = useState<string>('');

  // ── Fetch all data from API on mount ──────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          campusesRes, eventsRes, announcementsRes, usersRes,
          sermonsRes, seriesRes, worshipRes, galleryRes, livestreamRes,
          eventRegistrationsRes
        ] = await Promise.all([
          fetch('/api/admin/campuses').catch(() => null),
          fetch('/api/admin/events').catch(() => null),
          fetch('/api/admin/announcements').catch(() => null),
          fetch('/api/admin/users').catch(() => null),
          fetch('/api/admin/media/sermons').catch(() => null),
          fetch('/api/admin/media/sermon-series').catch(() => null),
          fetch('/api/admin/media/worship-videos').catch(() => null),
          fetch('/api/admin/media/gallery').catch(() => null),
          fetch('/api/admin/media/livestreams').catch(() => null),
          fetch('/api/admin/event-registrations').catch(() => null),
        ]);

        if (campusesRes?.ok) setCampuses(mapIds(await campusesRes.json()));
        if (eventsRes?.ok) setEvents(mapIds(await eventsRes.json()));
        if (announcementsRes?.ok) setAnnouncements(mapIds(await announcementsRes.json()));
        if (usersRes?.ok) {
          const rawUsers = await usersRes.json();
          setUsers(rawUsers.map((u: any) => ({
            id: u._id, _id: u._id, name: u.name || `${u.firstName} ${u.lastName}`,
            email: u.email, role: u.role, campusId: u.campusId, groups: u.groups || [],
          })));
        }
        if (sermonsRes?.ok) setSermons(mapIds(await sermonsRes.json()));
        if (seriesRes?.ok) setSermonSeriesState(mapIds(await seriesRes.json()));
        if (worshipRes?.ok) setWorshipVideos(mapIds(await worshipRes.json()));
        if (galleryRes?.ok) setGalleryAlbums(mapIds(await galleryRes.json()));
        if (livestreamRes?.ok) setLiveStreams(mapIds(await livestreamRes.json()));
        if (eventRegistrationsRes?.ok) setEventRegistrations(mapIds(await eventRegistrationsRes.json()));
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      }
    };
    fetchAll();
  }, []);

  const setCurrentUser = useCallback((u: UserProfile) => setCurrentUserState(u), []);
  const setGalleryAlbumUrl = useCallback((url: string) => setGalleryAlbumUrlState(url), []);

  // ── Live Streams ──────────────────────────────────────────────────────
  const updateLiveStream = useCallback(async (campusId: string, updates: Partial<LiveStream>) => {
    const ls = liveStreams.find(l => l.campusId === campusId);
    if (ls && (ls._id || ls.id)) {
      const id = ls._id || ls.id;
      const res = await fetch(`/api/admin/media/livestreams/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setLiveStreams(prev => prev.map(l => l.campusId === campusId ? mapId(updated) : l));
      }
    }
  }, [liveStreams]);

  // ── Gallery CRUD ──────────────────────────────────────────────────────
  const addGalleryAlbum = useCallback(async (a: Omit<GalleryAlbum, 'id'>) => {
    const res = await fetch('/api/admin/media/gallery', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(a),
    });
    if (res.ok) {
      const created = await res.json();
      setGalleryAlbums(prev => [...prev, mapId(created)]);
    }
  }, []);

  const updateGalleryAlbum = useCallback(async (id: string, a: Partial<GalleryAlbum>) => {
    const res = await fetch(`/api/admin/media/gallery/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(a),
    });
    if (res.ok) {
      const updated = await res.json();
      setGalleryAlbums(prev => prev.map(album => album.id === id ? mapId(updated) : album));
    }
  }, []);

  const deleteGalleryAlbum = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/media/gallery/${id}`, { method: 'DELETE' });
    if (res.ok) setGalleryAlbums(prev => prev.filter(a => a.id !== id));
  }, []);

  const reorderGalleryAlbums = useCallback((albums: GalleryAlbum[]) => {
    const reordered = albums.map((a, i) => ({ ...a, sortOrder: i }));
    setGalleryAlbums(reordered);
    // Fire-and-forget updates for sort order
    reordered.forEach(a => {
      fetch(`/api/admin/media/gallery/${a.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: a.sortOrder }),
      });
    });
  }, []);

  // ── Events CRUD ───────────────────────────────────────────────────────
  const addEvent = useCallback(async (e: Omit<Event, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/admin/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(e),
    });
    if (res.ok) {
      const created = await res.json();
      setEvents(prev => [...prev, mapId(created)]);
    }
  }, []);

  const updateEvent = useCallback(async (id: string, u: Partial<Event>) => {
    const res = await fetch(`/api/admin/events/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(u),
    });
    if (res.ok) {
      const updated = await res.json();
      setEvents(prev => prev.map(e => e.id === id ? mapId(updated) : e));
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setEvents(prev => prev.filter(e => e.id !== id));
      setEventRegistrations(prev => prev.filter(r => r.eventId !== id));
    }
  }, []);

  const addEventRegistration = useCallback(async (reg: Omit<EventRegistration, 'id' | 'registeredAt'>) => {
    const res = await fetch('/api/admin/event-registrations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reg),
    });
    if (res.ok) {
      const created = await res.json();
      setEventRegistrations(prev => [...prev, mapId(created)]);
      setEvents(prev => prev.map(e => e.id === reg.eventId ? { ...e, registered: e.registered + 1 } : e));
    }
  }, []);

  const getEventRegistrations = useCallback((eventId: string) => {
    return eventRegistrations.filter(r => r.eventId === eventId);
  }, [eventRegistrations]);

  // ── Announcements CRUD ────────────────────────────────────────────────
  const addAnnouncement = useCallback(async (a: Omit<Announcement, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/admin/announcements', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(a),
    });
    if (res.ok) {
      const created = await res.json();
      setAnnouncements(prev => [...prev, mapId(created)]);
    }
  }, []);

  const updateAnnouncement = useCallback(async (id: string, u: Partial<Announcement>) => {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(u),
    });
    if (res.ok) {
      const updated = await res.json();
      setAnnouncements(prev => prev.map(a => a.id === id ? mapId(updated) : a));
    }
  }, []);

  const deleteAnnouncement = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) setAnnouncements(prev => prev.filter(a => a.id !== id));
  }, []);

  // ── Users CRUD ────────────────────────────────────────────────────────
  const addUser = useCallback(async (u: Omit<UserProfile, 'id'>) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(u),
    });
    if (res.ok) {
      const created = await res.json();
      setUsers(prev => [...prev, { ...created, id: created._id }]);
    }
  }, []);

  const updateUser = useCallback(async (id: string, u: Partial<UserProfile>) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(u),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updated, id: updated._id } : user));
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  // ── Worship Videos CRUD ───────────────────────────────────────────────
  const addWorshipVideo = useCallback(async (v: Omit<WorshipVideo, 'id'>) => {
    const res = await fetch('/api/admin/media/worship-videos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v),
    });
    if (res.ok) {
      const created = await res.json();
      setWorshipVideos(prev => [...prev, mapId(created)]);
    }
  }, []);

  const updateWorshipVideo = useCallback(async (id: string, v: Partial<WorshipVideo>) => {
    const res = await fetch(`/api/admin/media/worship-videos/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v),
    });
    if (res.ok) {
      const updated = await res.json();
      setWorshipVideos(prev => prev.map(video => video.id === id ? mapId(updated) : video));
    }
  }, []);

  const deleteWorshipVideo = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/media/worship-videos/${id}`, { method: 'DELETE' });
    if (res.ok) setWorshipVideos(prev => prev.filter(v => v.id !== id));
  }, []);

  // ── Sermons CRUD ──────────────────────────────────────────────────────
  const addSermon = useCallback(async (s: Omit<Sermon, 'id' | 'views' | 'likes'>) => {
    const res = await fetch('/api/admin/media/sermons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...s, views: 0, likes: 0 }),
    });
    if (res.ok) {
      const created = await res.json();
      setSermons(prev => [...prev, mapId(created)]);
    }
  }, []);

  const updateSermon = useCallback(async (id: string, s: Partial<Sermon>) => {
    const res = await fetch(`/api/admin/media/sermons/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    });
    if (res.ok) {
      const updated = await res.json();
      setSermons(prev => prev.map(sermon => sermon.id === id ? mapId(updated) : sermon));
    }
  }, []);

  const deleteSermon = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/media/sermons/${id}`, { method: 'DELETE' });
    if (res.ok) setSermons(prev => prev.filter(s => s.id !== id));
  }, []);

  const reorderSermons = useCallback((sermons: Sermon[]) => {
    const reordered = sermons.map((s, i) => ({ ...s, sortOrder: i }));
    setSermons(reordered);
    reordered.forEach(s => {
      fetch(`/api/admin/media/sermons/${s.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: s.sortOrder }),
      });
    });
  }, []);

  // ── Sermon Series CRUD ────────────────────────────────────────────────
  const addSermonSeries = useCallback(async (s: Omit<SermonSeries, 'id'>) => {
    const res = await fetch('/api/admin/media/sermon-series', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    });
    if (res.ok) {
      const created = await res.json();
      setSermonSeriesState(prev => [...prev, mapId(created)]);
    }
  }, []);

  const updateSermonSeries = useCallback(async (id: string, s: Partial<SermonSeries>) => {
    const res = await fetch(`/api/admin/media/sermon-series/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    });
    if (res.ok) {
      const updated = await res.json();
      setSermonSeriesState(prev => prev.map(series => series.id === id ? mapId(updated) : series));
    }
  }, []);

  const deleteSermonSeries = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/media/sermon-series/${id}`, { method: 'DELETE' });
    if (res.ok) setSermonSeriesState(prev => prev.filter(s => s.id !== id));
  }, []);

  // ── Campuses CRUD ─────────────────────────────────────────────────────
  const addCampus = useCallback(async (c: Omit<Campus, 'id'>) => {
    const res = await fetch('/api/admin/campuses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    });
    if (res.ok) {
      const created = await res.json();
      setCampuses(prev => [...prev, mapId(created)]);
    }
  }, []);

  const updateCampus = useCallback(async (id: string, u: Partial<Campus>) => {
    const res = await fetch(`/api/admin/campuses/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(u),
    });
    if (res.ok) {
      const updated = await res.json();
      setCampuses(prev => prev.map(c => c.id === id ? mapId(updated) : c));
    }
  }, []);

  const deleteCampus = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/campuses/${id}`, { method: 'DELETE' });
    if (res.ok) setCampuses(prev => prev.filter(c => c.id !== id));
  }, []);

  // ── Groups CRUD (client-side only for now) ────────────────────────────
  const addGroup = useCallback((name: string) => {
    setGroups(prev => prev.includes(name) ? prev : [...prev, name]);
  }, []);
  const deleteGroup = useCallback((name: string) => {
    setGroups(prev => prev.filter(g => g !== name));
  }, []);

  // ── Filtering ─────────────────────────────────────────────────────────
  const getVisibleAnnouncements = useCallback((campusId: string, userGroups: string[]) => {
    return announcements.filter(a => {
      const tc = a.targetCampuses ?? ['all'];
      const tg = a.targetGroups ?? ['all'];
      const campusMatch = campusId === 'all' || tc.includes('all') || tc.includes(campusId);
      const groupMatch = tg.includes('all') || tg.some(g => userGroups.includes(g));
      return campusMatch && groupMatch;
    });
  }, [announcements]);

  const getVisibleEvents = useCallback((campusId: string, userGroups: string[]) => {
    return events.filter(e => {
      const tc = e.targetCampuses ?? ['all'];
      const tg = e.targetGroups ?? ['all'];
      const campusMatch = campusId === 'all' || tc.includes('all') || tc.includes(campusId);
      const groupMatch = tg.includes('all') || tg.some(g => userGroups.includes(g));
      return campusMatch && groupMatch;
    });
  }, [events]);

  return (
    <AdminDataContext.Provider value={{
      campuses, groups, events, eventRegistrations, announcements, users, currentUser, setCurrentUser,
      addEvent, updateEvent, deleteEvent, addEventRegistration, getEventRegistrations,
      addAnnouncement, updateAnnouncement, deleteAnnouncement,
      addUser, updateUser, deleteUser,
      addCampus, updateCampus, deleteCampus, addGroup, deleteGroup,
      getVisibleAnnouncements, getVisibleEvents,
      galleryAlbumUrl, setGalleryAlbumUrl,
      worshipVideos, addWorshipVideo, updateWorshipVideo, deleteWorshipVideo,
      sermons, addSermon, updateSermon, deleteSermon, reorderSermons,
      sermonSeries: sermonSeries, addSermonSeries, updateSermonSeries, deleteSermonSeries,
      galleryAlbums, addGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum, reorderGalleryAlbums,
      liveStreams, updateLiveStream,
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider');
  return ctx;
}
