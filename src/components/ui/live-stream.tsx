"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminData } from '@/lib/admin-data-context';
import { Play, Radio, Users, Heart, ExternalLink } from 'lucide-react';

export const LiveStreamSection = () => {
  const { liveStreams, campuses, currentUser } = useAdminData();
  const [selectedCampus, setSelectedCampus] = useState(currentUser?.campusId || 'main');
  const [viewerCount, setViewerCount] = useState(234);
  
  const activeStream = liveStreams.find(ls => ls.campusId === selectedCampus);
  const isLive = activeStream?.isLive || false;
  const youtubeVideoId = activeStream?.videoId || '';
  const youtubeEmbedUrl = youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1` : '';

  return (
    <section id="live-stream" className="py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-4xl font-bold">Live Worship</h2>
            <p className="text-xl text-muted-foreground">
              Join us online for live worship and fellowship
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-card border shadow-sm p-2 rounded-xl inline-flex items-center gap-3">
              <span className="text-sm font-medium px-2 text-muted-foreground">Select Campus:</span>
              <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                <SelectTrigger className="w-[200px] border-0 bg-muted/50 focus:ring-0 rounded-lg">
                  <SelectValue placeholder="Select Campus" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* YouTube Live Stream Player */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video">
                  {/* YouTube Embed or Fallback */}
                  {youtubeVideoId && isLive ? (
                    <iframe
                      src={youtubeEmbedUrl}
                      title="Live Worship Service"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/30 flex flex-col items-center justify-center p-8 text-center">
                      <Radio className="w-12 h-12 text-muted-foreground/30 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Stream Offline</h3>
                      <p className="text-muted-foreground max-w-sm">
                        This campus is not currently broadcasting live. Please check back during service times or explore other campuses.
                      </p>
                    </div>
                  )}
                  
                  {/* Live Indicator Overlay */}
                  {isLive && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-red-600 text-white gap-2 shadow-lg">
                        <Radio className="w-3 h-3" />
                        LIVE
                      </Badge>
                    </div>
                  )}
                  
                  {/* Viewer Count Overlay */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="gap-2 bg-black/70 text-white border-0">
                      <Users className="w-3 h-3" />
                      {viewerCount} watching
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">{activeStream?.title || 'Sunday Worship Service'}</h3>
                      <p className="text-muted-foreground">
                        {activeStream?.description || 'Join us online for worship and a powerful message from the word of God.'}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{campuses.find(c => c.id === selectedCampus)?.name}</Badge>
                      <Badge variant="outline">Live Broadcast</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${youtubeVideoId}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Watch on YouTube
                      </Button>
                      <Button variant="outline">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </section>
  );
};