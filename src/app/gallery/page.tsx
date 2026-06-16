"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminData } from '@/lib/admin-data-context';
import { useAuth } from '@/lib/auth-context';
import { 
  ImageIcon, 
  ChevronLeft, 
  ExternalLink, 
  X, 
  Loader2,
  Share2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function GalleryPage() {
  const { getVisibleGalleryAlbums } = useAdminData();
  const { getSessionMember, getEffectiveGroups } = useAuth();

  const sessionMember = getSessionMember();
  const effectiveGroups = sessionMember ? getEffectiveGroups(sessionMember) : [];
  
  const userGroups = effectiveGroups.length > 0
    ? Array.from(new Set([...effectiveGroups]))
    : ['all'];

  const galleryAlbums = getVisibleGalleryAlbums('all', userGroups as string[]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [albumCovers, setAlbumCovers] = useState<Record<string, string>>({});
  
  // Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [previewPhotos, setPreviewPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsScrolledDown(true);
      } else {
        setIsScrolledDown(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
    const source = selectedCategory === "All" ? galleryAlbums : galleryAlbums.filter(album => album.category === selectedCategory);
    return [...source].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [galleryAlbums, selectedCategory]);

  const fetchAlbumPreview = async (album: any) => {
    setSelectedAlbum(album);
    setIsPreviewOpen(true);
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
        // Randomly pick 5-6 photos
        const shuffled = [...data.photos].sort(() => 0.5 - Math.random());
        setPreviewPhotos(shuffled.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to fetch preview photos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group albums into rows of 3
  const albumRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < filteredAlbums.length; i += 3) {
      rows.push(filteredAlbums.slice(i, i + 3));
    }
    return rows;
  }, [filteredAlbums]);

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div 
        className={`sticky top-0 z-50 glass-header border-b border-primary/10 transition-all duration-300 ease-in-out ${
          isScrolledDown ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/#gallery">
            <Button variant="ghost" size="sm" className="gap-2 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center flex-1 pr-20">
            <h1 className="text-xl font-bold tracking-tight italic">Grace Photo Gallery</h1>
          </div>
        </div>
      </div>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-5xl font-bold text-heading">Full Album Collection</h2>
              <p className="text-xl text-subheading max-w-2xl mx-auto">
                Explore our full library of memories captured across events and fellowship.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-12">
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

            {/* Album Grid */}
            <div className="space-y-4 min-h-[400px]">
              {albumRows.map((row, rowIndex) => (
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
            </div>
          </div>
        </div>
      </section>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-primary/10 rounded-3xl">
          <div className="relative h-[400px] w-full bg-muted flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse italic">Fetching memories...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-0 w-full h-full">
                {previewPhotos.map((photo, i) => (
                  <div key={i} className="relative group overflow-hidden h-full">
                    <img 
                      src={photo.src} 
                      alt={`Preview ${i}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                ))}
              </div>
            )}
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/80 text-white border-0"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <DialogHeader className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Badge variant="glass" className="bg-primary/10 text-primary border-0">{selectedAlbum?.category}</Badge>
                <DialogTitle className="text-3xl font-bold italic tracking-tight">{selectedAlbum?.title}</DialogTitle>
                <p className="text-muted-foreground max-w-2xl leading-relaxed">
                  {selectedAlbum?.description}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  asChild 
                  size="lg" 
                  className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  <a href={selectedAlbum?.url} target="_blank" rel="noopener noreferrer">
                    View Full Album <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full gap-2">
                   <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}
