"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminData } from '@/lib/admin-data-context';


// Worship songs data removed (now managed via AdminDataContext)


const categoryColors = {
  'Worship': 'bg-amber-100 text-amber-800 border-amber-200',
  'Praise Song': 'bg-purple-100 text-purple-800 border-purple-200',
  'THE RESURRECTION - HINDI SONG': 'bg-blue-100 text-blue-800 border-blue-200',
  'Hindi Worship': 'bg-green-100 text-green-800 border-green-200',
  'Christmas Song': 'bg-red-100 text-red-800 border-red-200',
  'Worship song': 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

interface SongCarouselProps {
  className?: string;
}

export const SongCarousel: React.FC<SongCarouselProps> = ({ className }) => {
  const { worshipVideos } = useAdminData();
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const swiperRef = useRef<any>(null);

  const handlePlayPause = (songId: string, videoId: string) => {
    setIsTransitioning(true);
    setCurrentlyPlaying(songId);
    
    // Start the transition
    setTimeout(() => {
      setFullscreenVideo(videoId);
      setIsTransitioning(false);
    }, 300);
  };

  const closeFullscreen = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setFullscreenVideo(null);
      setCurrentlyPlaying(null);
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenVideo) {
        closeFullscreen();
      }
    };

    if (fullscreenVideo) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [fullscreenVideo]);


  return (
    <section className={`py-24 bg-gradient-to-br from-background via-background/95 to-secondary/5 ${className}`}>
      <div className="container mx-auto px-0">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent mb-6">
            Worship Music
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Listen to our collection of worship songs, hymns, and spiritual music. Let these melodies lift your spirit and draw you closer to God.
          </p>
        </div>

        <div className="relative group/carousel">
          <Swiper
            ref={swiperRef}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={true}
            slidesPerView="auto"
            speed={1000}
            initialSlide={0}
            loopAdditionalSlides={2}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 120,
              modifier: 2.5,
              slideShadows: true
            }}
            navigation={{
              nextEl: '.song-swiper-button-next',
              prevEl: '.song-swiper-button-prev',
            }}
            pagination={{
              el: '.song-swiper-pagination',
              clickable: true,
            }}
            modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
            className="song-carousel h-[580px] py-12"
          >
            {worshipVideos.map((song, index) => (
              <SwiperSlide key={song.id} className="w-[350px]">
                <Card className="group relative h-[480px] overflow-hidden border-0 shadow-elegant hover:shadow-glow transition-all duration-500">
                  <div className="relative h-full">
                    {/* Song Thumbnail */}
                    <div className="relative h-80 overflow-hidden">
                      <img 
                        src={`https://img.youtube.com/vi/${song.videoId}/maxresdefault.jpg`}
                        alt={song.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Invisible Play Button Overlay - Covers entire image */}
                      <div 
                        className="absolute inset-0 cursor-pointer flex items-center justify-center group-hover:bg-black/20 transition-colors duration-300"
                        onClick={() => handlePlayPause(song.id, song.videoId)}
                      >
                        {/* Optional: Subtle play icon that appears on hover */}
                        <div className="opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            {currentlyPlaying === song.id ? (
                              <Pause className="w-8 h-8 text-black" />
                            ) : (
                              <Play className="w-8 h-8 text-black ml-1" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Category Badges */}
                      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1">
                        {(song.categories || []).map(cat => (
                          <Badge key={cat} variant="secondary" className={categoryColors[cat as keyof typeof categoryColors]}>
                            {cat}
                          </Badge>
                        ))}
                      </div>

                      {/* Audio Visualizer */}
                      {currentlyPlaying === song.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 z-10">
                          <div className="h-full bg-primary animate-pulse" style={{ width: '45%' }} />
                        </div>
                      )}
                    </div>

                    {/* Song Info */}
                    <div className="p-6 bg-card">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-card-foreground mb-1 line-clamp-1">
                          {song.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-1">
                          by {song.artist}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {song.album} • {song.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Enhanced Transparent Hovering Navigation Buttons */}
          <Button
          variant="ghost"
          size="lg"
          className="song-swiper-button-prev absolute left-6 top-1/2 -translate-y-1/2 z-20 w-16 h-12 rounded-lg bg-black/21 backdrop-blur-md border border-white/30 hover:bg-black/40 hover:border-white/50 text-white transition-all duration-300 transform hover:scale-110 shadow-xl opacity-0 group-hover/carousel:opacity-50"
        >
          <ChevronLeft className="w-7 h-7" />
          <span className="sr-only">Previous</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="song-swiper-button-next absolute right-6 top-1/2 -translate-y-1/2 z-20 w-16 h-12 rounded-lg bg-black/20 backdrop-blur-md border border-white/30 hover:bg-black/40 hover:border-white/50 text-white transition-all duration-300 transform hover:scale-110 shadow-xl opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="w-7 h-7" />
            <span className="sr-only">Next</span>
          </Button>

          {/* Custom Pagination */}
          <div className="song-swiper-pagination relative mt-8 text-center" />
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="group">
            <a href="/music" className="flex items-center">
              Explore Music Library
              <div className="ml-2 transform transition-transform group-hover:translate-x-1">→</div>
            </a>
          </Button>
        </div>
      </div>

      {/* Enhanced Fullscreen Video Modal with Custom Animation */}
      {(fullscreenVideo || isTransitioning) && (
        <div 
          className={`fullscreen-modal ${isTransitioning && !fullscreenVideo ? 'closing' : ''}`}
          onClick={closeFullscreen}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-red-400 transition-all duration-300 text-2xl font-bold z-50 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              closeFullscreen();
            }}
          >
            ✕
          </button>
          
          <div 
            className="video-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            {fullscreenVideo && (
              <iframe
                src={`https://www.youtube.com/embed/${fullscreenVideo}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0`}
                title="YouTube video player"
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .song-carousel .song-swiper-button-prev::after,
          .song-carousel .song-swiper-button-next::after {
            content: none;
          }
          
          .song-carousel .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
            background: hsl(var(--muted));
            opacity: 0.5;
            transition: all 0.3s ease;
          }
          
          .song-carousel .swiper-pagination-bullet-active {
            background: hsl(var(--primary));
            opacity: 1;
            transform: scale(1.2);
          }
          
          .song-carousel .swiper-slide {
            transition: transform 0.3s ease;
          }
          
          .song-carousel .swiper-slide-active {
            transform: translateY(-10px);
          }
          
          /* Fullscreen Modal Animations */
          .fullscreen-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            animation: fadeInBackground 0.5s ease-out forwards;
          }
          
          @keyframes fadeInBackground {
            to {
              background: rgba(0, 0, 0, 0.8);
            }
          }
          
          .video-wrapper {
            width: 10rem;
            height: 10rem;
            display: flex;
            justify-content: center;
            align-items: center;
            background: black;
            border-radius: 2rem;
            overflow: hidden;
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
            transform: scale(1);
            animation: expandToFullscreen 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
          
          @keyframes expandToFullscreen {
            to {
              width: 80vw;
              height: 80vh;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            }
          }
          
          @keyframes shrinkFromFullscreen {
            to {
              width: 37rem;
              height: 42rem;
              box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
              transform: scale(0.8);
              opacity: 0;
            }
          }
          
          .fullscreen-modal.closing {
            animation: fadeOutBackground 0.4s ease-in forwards;
          }
          
          @keyframes fadeOutBackground {
            to {
              background: rgba(0, 0, 0, 0);
            }
          }
        `
      }} />
    </section>
  );
};