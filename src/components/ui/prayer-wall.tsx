"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Plus, Shield, Clock, Users } from 'lucide-react';

const prayerRequests = [
  {
    id: 1,
    title: "Healing for my mother",
    content: "Please pray for my mother who is recovering from surgery. She's in good spirits but needs strength for the healing process.",
    author: "Sarah M.",
    isAnonymous: false,
    privacy: "public",
    createdAt: "2024-12-15T10:30:00Z",
    prayedCount: 45,
    comments: 8,
    category: "Health"
  },
  {
    id: 2,
    title: "Job search guidance",
    content: "I've been looking for work for several months. Praying for God's direction and the right opportunity to provide for my family.",
    author: "Anonymous",
    isAnonymous: true,
    privacy: "public",
    createdAt: "2024-12-14T15:20:00Z",
    prayedCount: 23,
    comments: 4,
    category: "Career"
  },
  {
    id: 3,
    title: "Marriage restoration",
    content: "Please pray for healing and restoration in my marriage. We're going through a difficult time but believe God can work miracles.",
    author: "J.D.",
    isAnonymous: false,
    privacy: "members",
    createdAt: "2024-12-13T09:15:00Z",
    prayedCount: 67,
    comments: 12,
    category: "Relationships"
  },
  {
    id: 4,
    title: "Wisdom for our church leadership",
    content: "Praying for our pastoral team as they make important decisions about the upcoming building expansion and new ministry programs.",
    author: "Church Elder",
    isAnonymous: false,
    privacy: "public",
    createdAt: "2024-12-12T14:45:00Z",
    prayedCount: 89,
    comments: 15,
    category: "Church"
  }
];

const categoryColors = {
  Health: "bg-success/10 text-success",
  Career: "bg-accent/10 text-accent-foreground",
  Relationships: "bg-prayer/10 text-prayer",
  Church: "bg-primary/10 text-primary",
  Family: "bg-muted text-muted-foreground"
};

export const PrayerWall = () => {
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    content: '',
    isAnonymous: false,
    privacy: 'public'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Prayer request submitted:', newRequest);
    setShowForm(false);
    setNewRequest({ title: '', content: '', isAnonymous: false, privacy: 'public' });
  };

  return (
    <section id="prayers" className="py-16">
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
            <Card className="mb-8 border-prayer/20">
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
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Share your prayer request..."
                      rows={4}
                      value={newRequest.content}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, content: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={newRequest.isAnonymous}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="anonymous" className="text-sm">Post anonymously</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={newRequest.privacy}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, privacy: e.target.value }))}
                        className="text-sm border rounded px-3 py-1"
                      >
                        <option value="public">Public</option>
                        <option value="members">Members Only</option>
                        <option value="staff">Staff Only</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Submit Prayer Request</Button>
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
            <Button variant="outline" size="sm">Health</Button>
            <Button variant="outline" size="sm">Family</Button>
            <Button variant="outline" size="sm">Career</Button>
          </div>

          {/* Prayer Requests */}
          <div className="space-y-6">
            {prayerRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-elevated transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${categoryColors[request.category as keyof typeof categoryColors]} text-xs`}>
                          {request.category}
                        </Badge>
                        {request.privacy !== 'public' && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Shield className="w-3 h-3" />
                            {request.privacy === 'members' ? 'Members' : 'Staff Only'}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold">{request.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>By {request.author}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {request.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="gap-2 text-prayer hover:text-prayer">
                        <Heart className="w-4 h-4" />
                        <span>{request.prayedCount} prayed</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>{request.comments} comments</span>
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="bg-prayer/5 border-prayer/20 hover:bg-prayer/10">
                      I Prayed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Prayer Requests
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};