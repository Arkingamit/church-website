"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAdminData } from './admin-data-context';

export type MemberStatus = 'pending' | 'approved' | 'rejected';

export interface ChurchMember {
  id: string; // Updated to string for MongoDB _id
  _id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'male' | 'female';
  birthday?: string;
  maritalStatus?: 'single' | 'married';
  marriageDate?: string;
  campusId: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  password?: string;
  createdAt: string;
  status: MemberStatus;
  groups: string[];
  qrCode?: string;
  familyMemberId?: string;
  role?: string;
}

export interface AuthSession {
  memberId: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  session: AuthSession | null;
  members: ChurchMember[];
  isLoading: boolean;
  register: (data: Partial<ChurchMember> & { credential?: string }) => Promise<{ success: boolean; error?: string }>;
  login: (credential: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getMember: (id: string) => ChurchMember | undefined;
  getSessionMember: () => ChurchMember | undefined;
  getPendingRequests: (campusId?: string) => ChurchMember[];
  approveMember: (id: string, groups: string[]) => Promise<void>;
  rejectMember: (id: string) => Promise<void>;
  getApprovedMembers: () => ChurchMember[];
  getEffectiveGroups: (member: ChurchMember) => string[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<ChurchMember[]>([]);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use a ref or simple boolean to prevent infinite loops if we decouple admin context later
  const { addUser } = useAdminData();

  const fetchSessionAndMembers = async () => {
    try {
      const [sessionRes, membersRes] = await Promise.all([
        fetch('/api/auth/me').catch(() => null),
        fetch('/api/admin/users').catch(() => null)
      ]);

      if (sessionRes?.ok) {
        const data = await sessionRes.json();
        if (data.user) {
          setSession({
            memberId: data.user._id,
            email: data.user.email,
            name: data.user.name || `${data.user.firstName} ${data.user.lastName}`,
            role: data.user.role || 'member',
          });
        } else {
          setSession(null);
        }
      }

      if (membersRes?.ok) {
        const users = await membersRes.json();
        // Map _id to id for backwards compatibility with the UI
        setMembers(users.map((u: any) => ({ ...u, id: u._id })));
      }
    } catch (error) {
      console.error('Failed to fetch auth state', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndMembers();
  }, []);

  const register = useCallback(async (data: Partial<ChurchMember> & { credential?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || 'Failed to register' };
      
      await fetchSessionAndMembers(); // Refresh members list
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Network error during registration' };
    }
  }, []);

  const login = useCallback(async (credential: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || 'Login failed' };
      
      await fetchSessionAndMembers(); // Refresh session
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Network error during login' };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
  }, []);

  const getMember = useCallback((id: string) => members.find(m => m.id === id || m._id === id), [members]);

  const getApprovedMembers = useCallback(() => {
    return members.filter(m => m.status === 'approved');
  }, [members]);

  const getEffectiveGroups = useCallback((member: ChurchMember): string[] => {
    const ownGroups = member.groups || [];
    if (!member.familyMemberId) return ownGroups;
    const familyMember = members.find(m => m.id === member.familyMemberId);
    if (!familyMember) return ownGroups;
    const familyGroups = familyMember.groups || [];
    return Array.from(new Set([...ownGroups, ...familyGroups]));
  }, [members]);

  const getSessionMember = useCallback(() => {
    if (!session) return undefined;
    return members.find(m => m.id === session.memberId);
  }, [session, members]);

  const getPendingRequests = useCallback((campusId?: string) => {
    return members.filter(m =>
      m.status === 'pending' && (!campusId || m.campusId === campusId)
    );
  }, [members]);

  const approveMember = useCallback(async (id: string, groups: string[]) => {
    try {
      const qrCode = crypto.randomUUID(); // Optional, depending on your DB logic
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', groups, qrCode }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedUser, id: updatedUser._id } : m));
        
        // Ensure admin-data context is also aware (it might fetch on its own soon, but keep this for now)
        addUser({
          name: updatedUser.name || `${updatedUser.firstName} ${updatedUser.lastName}`,
          email: updatedUser.email,
          role: updatedUser.role || 'member',
          campusId: updatedUser.campusId,
          groups,
        });
      }
    } catch (e) {
      console.error('Failed to approve member', e);
    }
  }, [addUser]);

  const rejectMember = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedUser, id: updatedUser._id } : m));
      }
    } catch (e) {
      console.error('Failed to reject member', e);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      session, members, isLoading,
      register, login, logout,
      getMember, getSessionMember,
      getPendingRequests, approveMember, rejectMember,
      getApprovedMembers, getEffectiveGroups,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
