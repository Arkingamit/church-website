"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Share2, Heart, Calendar, User, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAdminData } from '@/lib/admin-data-context';

import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';
import gallery5 from '@/assets/gallery-5.jpg';
import gallery6 from '@/assets/gallery-6.jpg';

// Mock image data
const photos = [
  { id: 1, src: gallery1, title: "Sunday Morning Worship", category: "Worship" },
  { id: 2, src: gallery2, title: "Community Fellowship", category: "Fellowship"  },
  { id: 3, src: gallery3, title: "South Gujarat", category: "Group"},
  { id: 4, src: gallery4, title: "Youth Group Fun", category: "Youth"},
  { id: 5, src: gallery5, title: "Traditional Day Celebration", category: "Traditional Day"},
  { id: 6, src: gallery6, title: "Cricket Match", category: "Cricket"},
];

const categoryColors = {
  Worship: "bg-worship text-worship-text",
  Fellowship: "bg-fellowship text-fellowship-text",
  Music: "bg-music text-music-text",
  Youth: "bg-youth text-youth-text",
  Outreach: "bg-outreach text-outreach-text",
  Baptism: "bg-baptism text-baptism-text"
};

export default function GallerySection() {
  const { galleryAlbums } = useAdminData();
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [previewPhotos, setPreviewPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [albumCovers, setAlbumCovers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCovers = async () => {
      const newCovers: Record<number, string> = { ...albumCovers };
      let changed = false;
      
      for (const album of galleryAlbums) {
        if (!newCovers[album.id] && album.url) {
          try {
            const res = await fetch(`/api/gallery/photos?url=${encodeURIComponent(album.url)}`);
            if (!res.ok) {
              const errorData = await res.json();
              console.error(`API Error for album ${album.id}:`, errorData.error);
              continue;
            }
            const data = await res.json();
            if (data.photos && data.photos.length > 0) {
              const randomPhoto = data.photos[Math.floor(Math.random() * data.photos.length)];
              newCovers[album.id] = randomPhoto.src;
              changed = true;
            }
          } catch (err) {
            console.error(`Failed to fetch cover for album ${album.id}:`, err);
          }
        }
      }
      
      if (changed) {
        setAlbumCovers(newCovers);
      }
    };

    if (galleryAlbums.length > 0) {
      fetchCovers();
    }
  }, [galleryAlbums]);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(galleryAlbums.map(a => a.category)))];
  }, [galleryAlbums]);
  
  const filteredAlbums = useMemo(() => {
    const filtered = selectedCategory === "All" 
      ? galleryAlbums 
      : galleryAlbums.filter(a => a.category === selectedCategory);

    // Sort by sortOrder
    return [...filtered].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [galleryAlbums, selectedCategory]);

  const fetchAlbumPreview = async (album: any) => {
    setSelectedAlbum(album);
    setLoading(true);
    setPreviewPhotos([]);
    try {
      if (!album.url) {
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/gallery/photos?url=${encodeURIComponent(album.url)}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch photos');
      }
      const data = await res.json();
      if (data.photos) {
        setPreviewPhotos(data.photos);
      }
    } catch (err) {
      console.error('Failed to fetch album photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const closePreview = () => {
    setSelectedAlbum(null);
    setPreviewPhotos([]);
  };

  // Group albums into rows of 3 to match previous layout
  const allAlbumRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < filteredAlbums.length; i += 3) {
      rows.push(filteredAlbums.slice(i, i + 3));
    }
    return rows;
  }, [filteredAlbums]);

  // Home page limit: 6 albums (2 rows of 3)
  const displayRows = allAlbumRows.slice(0, 2);
  const hasMore = galleryAlbums.length > (displayRows.length * 3);

  return (
    <section id="gallery" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold text-heading">Photo Gallery</h2>
            <p className="text-xl text-subheading">
              Capturing moments of faith, fellowship, and community
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="transition-all duration-200"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Album Rows */}
          <div className="space-y-4 mb-8 min-h-[400px]">
            {displayRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-4 h-72" onMouseLeave={() => setHoveredId(null)}>
                {row.map(album => {
                  const isHovered = hoveredId === album.id;
                  const isRowHovered = row.some(p => p.id === hoveredId);
                  const shouldCompress = isRowHovered && !isHovered;

                  return (
                    <div
                      key={album.id}
                      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 ease-out glass-card border-0 ${
                        isHovered ? 'flex-[2.5]' : shouldCompress ? 'flex-[0.6]' : 'flex-1'
                      }`}
                      onMouseEnter={() => setHoveredId(album.id)}
                      onClick={() => fetchAlbumPreview(album)}
                    >
                      {/* Album Cover */}
                      <div className="w-full h-full bg-primary/5 flex items-center justify-center group overflow-hidden">
                        {albumCovers[album.id] ? (
                          <img 
                            src={albumCovers[album.id]} 
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <ImageIcon className="w-16 h-16 text-primary/10 group-hover:scale-110 transition-transform duration-700" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>

                      <Badge 
                        variant="glass"
                        className={`absolute top-4 left-4 border-0 transition-opacity duration-300 ${
                          shouldCompress ? 'opacity-0' : 'opacity-100'
                        }`}
                      >
                        {album.category}
                      </Badge>

                      <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white space-y-1">
                          <h3 className="text-2xl font-bold italic tracking-tight">{album.title}</h3>
                          <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">{album.description}</p>
                        </div>
                      </div>

                      {!isHovered && (
                        <div className={`absolute bottom-6 left-6 right-6 transition-opacity duration-300 ${shouldCompress ? 'opacity-0' : 'opacity-100'}`}>
                           <h3 className="text-xl font-bold text-white italic truncate">{album.title}</h3>
                        </div>
                      )}

                      {shouldCompress && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <h3 className="text-white font-bold text-center px-2 transform -rotate-90 whitespace-nowrap italic text-sm opacity-50">
                            {album.title}
                          </h3>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            
            {galleryAlbums.length === 0 && (
              <div className="text-center py-32 glass-card rounded-3xl border-0">
                <ImageIcon className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2 italic">No Albums Available</h3>
                <p className="text-muted-foreground">Check back later for photos from our recent events.</p>
              </div>
            )}
            
            {filteredAlbums.length === 0 && galleryAlbums.length > 0 && (
              <div className="text-center py-32 glass-card rounded-3xl border-0">
                <p className="text-muted-foreground">No albums found in the "{selectedCategory}" category.</p>
                <Button variant="ghost" className="mt-4" onClick={() => setSelectedCategory('All')}>
                  Clear Filter
                </Button>
              </div>
            )}
          </div>

          {/* Explore More Button */}
          {hasMore && (
            <div className="flex justify-center mt-12 mb-8">
              <Link href="/gallery">
                <Button variant="secondary" size="lg" className="rounded-full px-12 group">
                  Explore Full Gallery 
                  <Share2 className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal (Popup) */}
      {selectedAlbum && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="relative max-w-5xl w-full glass-card border-0 overflow-hidden shadow-2xl p-1">
            <div className="bg-background/40 p-8 rounded-[1.5rem] space-y-8">
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="glass" className="mb-2 text-primary">{selectedAlbum.category}</Badge>
                  <h2 className="text-4xl font-bold tracking-tight italic">{selectedAlbum.title}</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">{selectedAlbum.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/10"
                  onClick={closePreview}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Photos Grid */}
              <div className="relative min-h-[300px]">
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-muted-foreground animate-pulse text-sm font-bold uppercase tracking-widest">Fetching moments...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    {previewPhotos.map((photo, i) => (
                      <div key={i} className="aspect-square relative rounded-2xl overflow-hidden glass-card p-1 group">
                        <img
                          src={photo.src}
                          alt={photo.title}
                          className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                    {previewPhotos.length === 0 && !loading && (
                      <div className="col-span-full py-16 text-center border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center space-y-4">
                         <AlertCircle className="w-10 h-10 text-muted-foreground/30" />
                         <p className="text-muted-foreground italic">Unable to fetch preview photos. Please check the album link.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border/50">
                <p className="text-sm text-muted-foreground italic">
                  Showing {previewPhotos.length} preview photos from the album
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="rounded-full px-8 border-border/50" onClick={closePreview}>
                    Close
                  </Button>
                  <a href={selectedAlbum.url} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-full px-10 font-bold hover-lift gap-2">
                       View Full Album <Share2 className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}
