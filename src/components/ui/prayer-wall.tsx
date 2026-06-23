"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Plus, Shield, Clock, Users, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface PrayerRequest {
  id: string;
  title: string;
  content: string;
  authorName: string;
  prayedCount: number;
  comments: number;
  createdAt: string;
}



export const PrayerWall = () => {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [newRequest, setNewRequest] = useState({
    title: '',
    content: '',
    authorName: '',
    campusId: ''
  });

  const { getSessionMember } = useAuth();
  const sessionMember = getSessionMember();
  const [campuses, setCampuses] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetch('/api/campuses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCampuses(data.map(c => ({ id: c._id || c.id, name: c.name })));
      })
      .catch(console.error);
  }, []);

  const fetchPrayers = async () => {
    try {
      const res = await fetch('/api/prayers');
      if (res.ok) {
        const data = await res.json();
        setPrayers(data);
      }
    } catch (error) {
      console.error('Failed to fetch prayers', error);
      toast.error('Failed to load prayer requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not logged in, require campus selection
    if (!sessionMember && !newRequest.campusId) {
      toast.error('Please select a campus');
      return;
    }
    
    setSubmitting(true);

    try {
      const payload = { ...newRequest };
      // If logged in, the backend will auto-assign their campus, but we can send it explicitly too
      if (sessionMember) {
        payload.campusId = sessionMember.campusId;
      }

      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Prayer request submitted! It will appear once approved by your campus leader.');
        setShowForm(false);
        setNewRequest({ title: '', content: '', authorName: '', campusId: '' });
        fetchPrayers(); // Reload the list (it won't show up until approved though)
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit prayer request');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePray = async (id: string) => {
    try {
      const res = await fetch(`/api/prayers/${id}/pray`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // Optimistically update the UI
        setPrayers(prev => prev.map(p => p.id === id ? { ...p, prayedCount: data.prayedCount } : p));
        toast.success('You prayed for this request');
      } else {
        const data = await res.json();
        toast.error(data.error || 'You already prayed for this');
      }
    } catch (error) {
      toast.error('Failed to record prayer');
    }
  };

  return (
    <section id="prayers" className="py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold">Prayer Wall</h2>
            <p className="text-xl text-muted-foreground">
              Share your prayer requests and pray for others in our community
            </p>
          </div>

          {/* Add Prayer Request Button */}
          <div className="text-center mb-8">
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-prayer to-prayer/80 hover:opacity-90"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Share Prayer Request
            </Button>
          </div>

          {/* Prayer Request Form */}
          {showForm && (
            <Card className="mb-8 border-prayer/20 animate-in fade-in slide-in-from-top-4">
              <CardHeader>
                <h3 className="text-lg font-semibold">Share Your Prayer Request</h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Prayer request title"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                      required
                      minLength={3}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Share your prayer request..."
                      rows={4}
                      value={newRequest.content}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, content: e.target.value }))}
                      required
                      minLength={10}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="Your Name (Optional)"
                        value={newRequest.authorName}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, authorName: e.target.value }))}
                      />
                    </div>

                    
                    {!sessionMember && (
                      <div className="sm:col-span-2">
                        <select
                          value={newRequest.campusId}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, campusId: e.target.value }))}
                          className="w-full text-sm border rounded px-3 py-2 bg-transparent"
                          required
                        >
                          <option value="">Select your Campus *</option>
                          {campuses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Building2 className="w-3 h-3 inline mr-1" />
                          Required so we can route your request to the correct campus leader for approval.
                        </p>
                      </div>
                    )}
                  </div>



                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Prayer Request
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Filter Options */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Button variant="default" size="sm">All Prayers</Button>
            <Button variant="outline" size="sm">Recent</Button>
            <Button variant="outline" size="sm">Most Prayed</Button>
          </div>

          {/* Prayer Requests */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-prayer" />
            </div>
          ) : prayers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No prayer requests found. Be the first to share one!
            </div>
          ) : (
            <div className="space-y-6">
              {prayers.map((request) => (
                <Card key={request.id} className="hover:shadow-elevated transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">

                        </div>
                        <h3 className="text-lg font-semibold">{request.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>By {request.authorName}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                      {request.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="gap-2 text-prayer hover:text-prayer cursor-default">
                          <Heart className="w-4 h-4" />
                          <span>{request.prayedCount} prayed</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 cursor-default">
                          <MessageCircle className="w-4 h-4" />
                          <span>{request.comments} comments</span>
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-prayer/5 border-prayer/20 hover:bg-prayer/10 transition-colors"
                        onClick={() => handlePray(request.id)}
                      >
                        I Prayed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          {!loading && prayers.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Load More Prayer Requests
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};