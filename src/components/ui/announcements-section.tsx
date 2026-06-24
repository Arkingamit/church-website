"use client";

import React, { useState } from 'react';
import { useAdminData } from '@/lib/admin-data-context';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Pin, Share2, Heart, Building2, Users } from 'lucide-react';

const categoryColors: Record<string, string> = {
  Worship: "bg-primary/10 text-primary",
  Membership: "bg-accent/10 text-accent-foreground",
  Youth: "bg-success/10 text-success",
  Outreach: "bg-prayer/10 text-prayer",
  Urgent: "bg-destructive/10 text-destructive"
};

export const AnnouncementsSection = () => {
  const { campuses, groups, getVisibleAnnouncements } = useAdminData();
  const { getSessionMember, getEffectiveGroups } = useAuth();
  const [selectedCampus] = useState('all');
  const [selectedGroup] = useState('all');

  // Merge family member's groups into visibility filter
  const sessionMember = getSessionMember();
  const effectiveGroups = sessionMember ? getEffectiveGroups(sessionMember) : [];

  const isAdminOrLeader = sessionMember?.role === 'admin' || sessionMember?.role === 'super_admin' || sessionMember?.role === 'campus_leader';
  const allowedGroups = isAdminOrLeader 
    ? groups 
    : Array.from(new Set([...effectiveGroups, 'all']));

  // For the dropdown filter: only filter if they select a specific group/campus
  // and we pass allowedGroups to getVisibleAnnouncements to enforce security at the data level
  const userGroups = selectedGroup === 'all' 
    ? allowedGroups 
    : (allowedGroups.includes(selectedGroup) || isAdminOrLeader ? [selectedGroup] : []);

  const campusForFilter = selectedCampus === 'all' ? 'all' : selectedCampus;

  const visibleAnnouncements = getVisibleAnnouncements(campusForFilter, userGroups as string[], sessionMember?.role || 'member');

  return (
    <section id="announcements" className="py-10 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-4xl font-bold">Church Announcements</h2>
            <p className="text-xl text-muted-foreground">
              Stay connected with what's happening in our community
            </p>
          </div>

          {/* Announcements List */}
          <div className="space-y-6">
            {visibleAnnouncements.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No announcements for your selection.</p>
                <p className="text-sm text-muted-foreground mt-1">Try selecting a different campus or group.</p>
              </div>
            )}
            {visibleAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="overflow-hidden hover:shadow-elevated transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {announcement.isPinned && (
                          <Pin className="w-4 h-4 text-accent fill-current" />
                        )}

                        {/* Show targeting info */}
                        {!announcement.targetCampuses?.includes('all') && (
                          <Badge variant="outline" className="text-[9px] gap-1">
                            <Building2 className="w-2.5 h-2.5" />
                            {announcement.targetCampuses?.map(id => campuses.find(c => c.id === id)?.name || id).join(', ')}
                          </Badge>
                        )}
                        {!announcement.targetGroups?.includes('all') && (
                          <Badge variant="outline" className="text-[9px] gap-1">
                            <Users className="w-2.5 h-2.5" />
                            {announcement.targetGroups?.join(', ')}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold leading-tight">
                        {announcement.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {announcement.reminderDate && announcement.reminderTime && (
                          <div className="flex items-center gap-1 text-blue-500">
                            <Calendar className="w-3 h-3" />
                            <span>Scheduled for {announcement.reminderDate} at {announcement.reminderTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {announcement.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Heart className="w-4 h-4" />
                        <span>{announcement.reactions}</span>
                      </Button>

                    </div>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};