"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, Heart, Music, Calendar, BookOpen, Share2, MapPin, Clock, ChevronRight, User, Play, Sparkles, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminData, type FlipCardItem } from '@/lib/admin-data-context';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';

const christianIcons = [
  // Cross
  <svg key="cross" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary animate-pulse"><path d="M12 3v18M8 8h8" /></svg>,
  // Dove
  <svg key="dove" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary animate-pulse"><path d="M15 4c-3 0-6 4-6 4S7 7 4 8c0 0 4 2 4 5 0 3-4 6-4 6s6-3 8-3c2 0 6 3 6 3 0-3-2-6-2-6s2-3 2-5c0-2-3-4-3-4z" /></svg>,
  // Crown
  <svg key="crown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary animate-pulse"><path d="M2 20h20M4 20l2-10 4 5 2-8 2 8 4-5 2 10" /></svg>,
  // Open Bible / Book
  <svg key="bible" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary animate-pulse"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>,
  // Fire / Holy Spirit
  <svg key="fire" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary animate-pulse"><path d="M12 22c5 0 9-4 9-9 0-4-3-6-5-9-1-1-2-2-4-2s-3 1-4 2c-2 3-5 5-5 9 0 5 4 9 9 9z M12 22v-6" /></svg>
];

const cardGradients = [
  "from-[#8B2323]/15 via-white to-[#A04A00]/15",
  "from-[#721515]/15 via-white to-[#3A0A0A]/15",
  "from-[#A04A00]/15 via-white to-[#8B2323]/15",
];

export function MobileHomeView() {
  const { events, worshipVideos, flipCardConfig, announcements, sermons, prayerRequests, getVisibleGalleryAlbums } = useAdminData();
  const { session, getSessionMember, getEffectiveGroups, logout } = useAuth();
  
  const sessionMember = getSessionMember();
  const effectiveGroups = sessionMember ? getEffectiveGroups(sessionMember) : [];
  const userGroups = effectiveGroups.length > 0 ? Array.from(new Set([...effectiveGroups])) : ['all'];
  const galleryAlbums = getVisibleGalleryAlbums('all', userGroups as string[]);
  
  // Fallback verse if API fails
  const [verse, setVerse] = useState({
    text: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1"
  });

  React.useEffect(() => {
    fetch('/api/verses/today')
      .then(res => res.json())
      .then(data => {
        if (data && data.text) setVerse(data);
      })
      .catch(console.error);
  }, []);

  const [activeIdx, setActiveIdx] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);
  const [albumCovers, setAlbumCovers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCovers = async () => {
      const newCovers: Record<string, string> = { ...albumCovers };
      let changed = false;
      
      for (const album of galleryAlbums.slice(0, 5)) {
        if (!newCovers[album.id] && album.url) {
          try {
            const res = await fetch(`/api/gallery/photos?url=${encodeURIComponent(album.url)}`);
            if (res.ok) {
              const data = await res.json();
              if (data.photos && data.photos.length > 0) {
                newCovers[album.id] = album.coverImage || data.photos[0].src;
                changed = true;
              }
            }
          } catch (err) {}
        }
      }
      
      if (changed) setAlbumCovers(newCovers);
    };

    if (galleryAlbums.length > 0) {
      fetchCovers();
    }
  }, [galleryAlbums]);

  const flipItems = flipCardConfig.items || [];

  const getDisplayDetails = (item: FlipCardItem) => {
    let displayTitle = item.title || '';
    let displayDesc = item.description || '';
    let displayBtn = item.buttonText || 'Read More';
    let displayLink = item.buttonLink || '#';

    if (item.type === 'event') {
      const event = events.find(e => e.id === item.itemId);
      if (event) {
        displayTitle = event.title;
        displayDesc = event.description || '';
        displayLink = `/events`;
        displayBtn = 'View Event';
      }
    } else if (item.type === 'announcement') {
      const ann = announcements.find(a => a.id === item.itemId);
      if (ann) {
        displayTitle = ann.title;
        displayDesc = ann.content;
        displayLink = `/`;
        displayBtn = 'Read Announcement';
      }
    } else if (item.type === 'sermon') {
      const sermon = sermons.find(s => s.id === item.itemId);
      if (sermon) {
        displayTitle = sermon.title;
        displayDesc = `${sermon.pastor} - ${new Date(sermon.date).toLocaleDateString()}`;
        displayLink = `/sermons/series/${sermon.seriesId}`;
        displayBtn = 'Watch Sermon';
      }
    } else if (item.type === 'worship_video') {
      const video = worshipVideos.find(v => v.id === item.itemId);
      if (video) {
        displayTitle = video.title;
        displayDesc = 'Join us in worship';
        displayLink = `https://youtube.com/watch?v=${video.videoId}`;
        displayBtn = 'Watch Video';
      }
    } else if (item.type === 'prayer') {
      const prayer = prayerRequests.find(p => p.id === item.itemId);
      if (prayer) {
        displayTitle = prayer.title;
        displayDesc = prayer.content;
        displayLink = `/prayer-wall`;
        displayBtn = 'Pray With Us';
      }
    }

    return { displayTitle, displayDesc, displayBtn, displayLink };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const today = new Date();
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentWorship = worshipVideos.slice(0, 5);

  return (
    <React.Fragment>
      {/* Splash Screen Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] bg-[#FAF7F2] flex flex-col items-center justify-center w-full h-[100dvh]"
            style={{
              backgroundImage: 'var(--bg-pattern)',
              backgroundRepeat: 'repeat',
              backgroundSize: '240px 240px'
            }}
          >
            <motion.div
              animate={{ 
                opacity: [1, 0.85, 1],
                scale: [1, 1.06, 1],
                filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="flex flex-col items-center gap-6"
            >
              <img src="/logo.png" alt="Grace Community Fire" className="w-40 h-40 object-contain drop-shadow-[0_0_25px_rgba(139,35,35,0.6)]" />
              <h1 className="text-3xl font-serif font-bold text-[#8B2323] tracking-wider text-center">Ahmedabad</h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={`md:hidden flex flex-col min-h-screen text-[#3A2D27] pb-24 font-sans relative w-full ${showSplash ? 'h-[100dvh] overflow-hidden' : 'overflow-x-hidden'}`}
        style={{
          backgroundColor: '#FAF7F2',
          backgroundImage: 'var(--bg-pattern)',
          backgroundRepeat: 'repeat',
          backgroundSize: '240px 240px'
        }}
      >

      {/* 1. Header */}
      <header 
        className="sticky top-0 z-50 flex items-center justify-between px-4 pt-6 pb-4 border-b border-[#a59d94]/60 shadow-[0_4px_16px_-2px_rgba(58,45,39,0.12),0_1px_0px_rgba(255,255,255,0.6)_inset]"
        style={{
          backgroundColor: '#FAF7F2',
          backgroundImage: 'var(--bg-pattern)',
          backgroundRepeat: 'repeat',
          backgroundSize: '240px 240px'
        }}
      >
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Grace Community" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-bold font-serif text-[#1A202C]">Grace Ahmedabad</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/search" className="w-10 h-10 rounded-full bg-[#F3EAE1] flex items-center justify-center text-[#8B2323]">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/notifications" className="relative w-10 h-10 rounded-full bg-[#F3EAE1] flex items-center justify-center text-[#8B2323]">
            <Bell className={`w-5 h-5 ${((announcements?.length || 0) + (prayerRequests?.length || 0) > 0) ? 'animate-jiggle origin-top' : ''}`} />
            {((announcements?.length || 0) + (prayerRequests?.length || 0) > 0) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-white"></span>
            )}
          </Link>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B2323] to-[#721515] flex items-center justify-center border-2 border-white shadow-sm outline-none">
                  <span className="text-xs font-bold text-white">{getInitials(session.name)}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-[#E5D5C5]">
                <DropdownMenuLabel className="font-bold text-[#1A202C]">{session.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                {['admin', 'superadmin', 'super_admin', 'staff', 'group_leader', 'campus_leader'].includes(session.role?.toLowerCase() || '') && (
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-[#8B2323] font-bold">
                    <Link href="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={async () => {
                    await logout();
                    window.location.href = '/';
                  }}
                  className="rounded-xl cursor-pointer text-red-600 font-bold focus:text-red-600"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="w-10 h-10 rounded-full bg-[#E5D5C5] flex items-center justify-center text-[#8B2323] border-2 border-white shadow-sm">
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>
      </header>

      <div className="px-4 pt-4 space-y-8">
        
        {/* 2. Hero Card */}
        <div className="rounded-[2rem] bg-gradient-to-br from-[#721515] to-[#3A0A0A] text-white overflow-hidden shadow-xl">
          <div className="p-6 pb-8 space-y-6 ">
            <div className="space-y-2">
              <p className="text-white/80 text-sm font-medium">Welcome to</p>
              <h2 className="text-4xl font-serif font-bold leading-tight">
                Grace <br/>Community
              </h2>
              <p className="text-white/70 text-sm pt-2 leading-relaxed">
                Where faith grows, hearts connect,<br/>and lives are transformed.
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <Button asChild className="flex-1 bg-[#A04A00] hover:bg-[#8A4000] text-white rounded-xl py-6 font-semibold">
                <Link href="/visit">Join Sunday</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 border-white/20 hover:bg-white/10 text-white rounded-xl py-6 font-semibold bg-transparent">
                <Link href="/live">Watch Live</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-white/10 bg-black/10">
            <div className="p-4 text-center border-r border-white/10">
              <div className="text-xl font-bold">2,500</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider mt-1">Members</div>
            </div>
            <div className="p-4 text-center border-r border-white/10">
              <div className="text-xl font-bold">25+</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider mt-1">Groups</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xl font-bold">15</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider mt-1">Yrs Serving</div>
            </div>
          </div>
        </div>

        {/* 3. Quick Links Row */}
        <div className="flex justify-between gap-3">
          <Link href="/events" className="flex-1 flex flex-col items-center justify-center gap-2 bg-[#F1E8DC] rounded-2xl py-4 hover:bg-[#E5D5C5] transition-all active:scale-95 duration-150">
            <Calendar className="w-6 h-6 text-[#8B2323]" />
            <span className="text-xs font-semibold text-[#8B2323]">Events</span>
          </Link>
          <Link href="/music" className="flex-1 flex flex-col items-center justify-center gap-2 bg-[#F1E8DC] rounded-2xl py-4 hover:bg-[#E5D5C5] transition-all active:scale-95 duration-150">
            <Music className="w-6 h-6 text-[#8B2323]" />
            <span className="text-xs font-semibold text-[#8B2323]">Worship</span>
          </Link>
          <Link href="/prayer-wall" className="flex-1 flex flex-col items-center justify-center gap-2 bg-[#F1E8DC] rounded-2xl py-4 hover:bg-[#E5D5C5] transition-all active:scale-95 duration-150">
            <Heart className="w-6 h-6 text-[#8B2323]" />
            <span className="text-xs font-semibold text-[#8B2323]">Prayer</span>
          </Link>
          <Link href="/sermons" className="flex-1 flex flex-col items-center justify-center gap-2 bg-[#F1E8DC] rounded-2xl py-4 hover:bg-[#E5D5C5] transition-all active:scale-95 duration-150">
            <BookOpen className="w-6 h-6 text-[#8B2323]" />
            <span className="text-xs font-semibold text-[#8B2323]">Sermon</span>
          </Link>
        </div>

        {/* 4. Highlight Stacked Cards */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-serif font-bold text-[#1A202C] border-l-4 border-[#8B2323] pl-3 py-0.5 leading-none">Highlights</h2>
            <span className="text-[#8B2323] text-xs font-bold flex items-center bg-[#FBE8E8] px-2 py-1 rounded-full">
              Swipe <ChevronRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          
          <div className="relative w-full h-[360px] flex justify-center items-center perspective-1000">
            {(() => {
              const allCards: { type: string; id: string; data: any }[] = [
                { type: 'verse', id: 'verse-card', data: verse }
              ];
              
              if (session && flipCardConfig.isActive) {
                flipItems.forEach((item, idx) => {
                  allCards.push({ type: 'admin', id: item.id || `admin-${idx}`, data: item });
                });
              }

              const stackRotations = ['rotate-0', 'rotate-2', '-rotate-2'];
              const stackScales = ['scale-100', 'scale-95', 'scale-90'];
              const stackTranslateY = ['translate-y-0', 'translate-y-4', 'translate-y-8'];
              const stackZIndex = [30, 20, 10];
              const stackOpacity = [1, 0.9, 0.5];

              const stack = [];
              for (let i = 0; i < Math.min(allCards.length, 3); i++) {
                const idx = (activeIdx + i) % allCards.length;
                stack.push({ item: allCards[idx], stackPos: i, originalIndex: idx });
              }

              // Reverse so the front card (stackPos 0) renders last (on top) in the DOM
              const orderedStack = stack.reverse();

              return (
                <AnimatePresence>
                  {orderedStack.map(({ item, stackPos, originalIndex }) => {
                    const isFront = stackPos === 0;

                    let cardContent;
                    if (item.type === 'verse') {
                      cardContent = (
                        <div className="bg-[#F1E8DC] rounded-3xl p-6 shadow-xl h-full flex flex-col justify-between border-2 border-white/50 w-full pointer-events-auto">
                          <div className="flex justify-between items-start">
                            <span className="bg-[#E5D5C5] text-[#7A6150] text-xs font-bold px-3 py-1.5 rounded-full">
                              Daily Verse
                            </span>
                            <button className="w-8 h-8 rounded-full bg-[#E5D5C5] flex items-center justify-center text-[#7A6150]">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="my-auto pointer-events-none">
                            <h3 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#8B2323] mb-3 leading-tight line-clamp-4">
                              "{item.data.text}"
                            </h3>
                            <p className="text-right text-[#7A6150] font-medium">— {item.data.reference}</p>
                          </div>
                          
                          <Button asChild className="w-full bg-[#7A3608] hover:bg-[#602A06] text-white rounded-xl py-6 font-semibold text-base mt-4 shrink-0 pointer-events-auto">
                            <Link href="/devotionals" onPointerDown={(e) => e.stopPropagation()}>Read Devotional</Link>
                          </Button>
                        </div>
                      );
                    } else {
                      const { displayTitle, displayDesc, displayBtn, displayLink } = getDisplayDetails(item.data);
                      cardContent = (
                        <Card className={`p-6 w-full h-full shadow-xl border-2 border-white flex flex-col justify-center items-center text-center bg-gradient-to-br ${cardGradients[originalIndex % cardGradients.length]} backdrop-blur-md rounded-3xl overflow-hidden pointer-events-auto`}>
                          <div className="space-y-4 w-full my-auto pointer-events-none">
                            <div className="mx-auto w-12 h-12 rounded-full bg-[#8B2323]/10 flex items-center justify-center">
                              {christianIcons[originalIndex % christianIcons.length]}
                            </div>
                            <h3 className="text-xl font-bold text-[#3A2D27] line-clamp-2 leading-tight">
                              {displayTitle}
                            </h3>
                            <p className="text-[#7A6150] text-sm px-1 line-clamp-3">
                              {displayDesc}
                            </p>
                          </div>
                          <div className="pt-2 w-full mt-4 shrink-0 pointer-events-auto">
                            <Button className="w-full bg-[#8B2323] hover:bg-[#721515] text-white rounded-xl py-6 font-semibold text-base group/btn" asChild>
                              <Link href={displayLink} onPointerDown={(e) => e.stopPropagation()}>
                                {displayBtn}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          </div>
                        </Card>
                      );
                    }

                    return (
                      <motion.div
                        key={`${item.id}-${originalIndex}`}
                        className={`absolute top-0 w-[85vw] max-w-sm h-[320px] transition-all duration-300 ease-out origin-bottom ${!isFront ? stackRotations[stackPos] : ''} ${!isFront ? stackScales[stackPos] : ''} ${!isFront ? stackTranslateY[stackPos] : ''}`}
                        style={{ zIndex: stackZIndex[stackPos], opacity: stackOpacity[stackPos] }}
                        drag={isFront ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.8}
                        onDragEnd={(e, info) => {
                          if (info.offset.x > 80 || info.offset.x < -80) {
                            setActiveIdx(prev => (prev + 1) % allCards.length);
                          }
                        }}
                        whileDrag={{ scale: 1.05, rotate: 2, cursor: "grabbing" }}
                      >
                        {cardContent}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              );
            })()}
          </div>
        </div>

        {/* 5. Upcoming Events */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-serif font-bold text-[#1A202C] border-l-4 border-[#8B2323] pl-3 py-0.5 leading-none">Upcoming Events</h2>
            <Link href="/events" className="text-[#8B2323] text-sm font-bold flex items-center">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x no-scrollbar">
            {upcomingEvents.map(event => {
              const eventDate = new Date(event.date);
              return (
                <Link href={`/events/${event.id}`} key={event.id} className="min-w-[260px] max-w-[280px] bg-white rounded-3xl p-4 flex gap-4 shadow-sm snap-start">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF5F5] flex flex-col items-center justify-center shrink-0 border border-red-50">
                    <span className="text-xl font-bold text-[#8B2323] leading-none">{eventDate.getDate()}</span>
                    <span className="text-xs font-bold text-[#8B2323] mt-1">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-[#1A202C] leading-tight mb-2 line-clamp-1">{event.title}</h4>
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-[#7A6150] font-medium">
                        <Clock className="w-3 h-3 mr-1.5" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-xs text-[#7A6150] font-medium">
                        <MapPin className="w-3 h-3 mr-1.5" />
                        <span className="line-clamp-1">{event.location || 'Grace Community'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 6. Worship Focus */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-serif font-bold text-[#1A202C] border-l-4 border-[#8B2323] pl-3 py-0.5 leading-none">Worship Focus</h2>
            <Link href="/music" className="text-[#8B2323] text-sm font-bold flex items-center">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x no-scrollbar">
            {recentWorship.map(video => (
              <a href={`https://youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" key={video.id} className="min-w-[280px] w-[280px] h-[160px] rounded-3xl overflow-hidden relative shadow-sm snap-start group block">
                <img src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center pl-1 shadow-lg">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <h4 className="text-white font-bold leading-tight line-clamp-1 text-sm">{video.title}</h4>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 6.5 Photo Gallery */}
        {galleryAlbums.length > 0 && (
          <div>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-2xl font-serif font-bold text-[#1A202C] border-l-4 border-[#8B2323] pl-3 py-0.5 leading-none">Photo Gallery</h2>
              <Link href="/gallery" className="text-[#8B2323] text-sm font-bold flex items-center">
                See all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x no-scrollbar">
              {galleryAlbums.slice(0, 5).map(album => (
                <Link href="/gallery" key={album.id} className="min-w-[220px] w-[220px] h-[220px] rounded-3xl overflow-hidden relative shadow-sm snap-start group block">
                  {albumCovers[album.id] ? (
                    <img src={albumCovers[album.id]} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#E5D5C5] flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-[#7A6150]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full self-start mb-2">
                      {album.category}
                    </span>
                    <h4 className="text-white font-bold leading-tight line-clamp-2 text-sm">{album.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 7. Prayer Wall CTA */}
        <div className="rounded-[2.5rem] bg-gradient-to-b from-[#8B2323] to-[#5C1111] p-8 text-center text-white relative overflow-hidden mt-6 mb-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm shadow-inner">
              <Heart className="w-6 h-6 text-white fill-white/20" />
            </div>
            
            <h3 className="text-3xl font-serif font-bold mb-3">Prayer Wall</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-[260px]">
              We would love to pray with you. Let us know how we can support you this week.
            </p>
            
            <Link href="/prayer-wall" className="w-full">
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 bg-white/5 rounded-xl py-6 font-semibold border-2">
                Submit Prayer Request <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 8. Recent Prayers */}
        {prayerRequests && prayerRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-2xl font-serif font-bold text-[#1A202C] border-l-4 border-[#8B2323] pl-3 py-0.5 leading-none">Community Prayers</h2>
              <Link href="/prayer-wall" className="text-[#8B2323] text-sm font-bold flex items-center">
                See all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {prayerRequests
                .filter(p => p.status === 'approved' || p.status === undefined)
                .slice(0, 3)
                .map(prayer => (
                   <PrayerCard key={prayer.id} prayer={prayer} session={session} />
                ))
              }
            </div>
          </div>
        )}

      </div>
    </div>
    </React.Fragment>
  );
}

function PrayerCard({ prayer, session }: { prayer: any, session: any }) {
  const [prayedCount, setPrayedCount] = useState(prayer.prayedCount || 0);
  const [hasPrayed, setHasPrayed] = useState(
    prayer.prayedBy && session && prayer.prayedBy.includes(session.userId)
  );

  const handlePray = async () => {
    if (hasPrayed) return;
    
    // Optimistic UI update
    setHasPrayed(true);
    setPrayedCount(prev => prev + 1);

    try {
      const res = await fetch(`/api/prayers/${prayer.id}/pray`, { method: 'POST' });
      if (!res.ok) {
        // Revert on failure
        setHasPrayed(false);
        setPrayedCount(prev => prev - 1);
      }
    } catch (err) {
      setHasPrayed(false);
      setPrayedCount(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F3EAE1]">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-[#1A202C] leading-tight">{prayer.title}</h4>
        <span className="text-[10px] text-[#7A6150] font-medium bg-[#F1E8DC] px-2 py-1 rounded-full whitespace-nowrap ml-2">
          {new Date(prayer.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <p className="text-[#7A6150] text-sm line-clamp-2 mb-3">{prayer.content}</p>
      
      <div className="flex items-center justify-between border-t border-[#F3EAE1] pt-3 mt-1">
        <div className="flex items-center text-xs font-semibold text-[#8B2323]">
          <User className="w-3.5 h-3.5 mr-1.5" />
          {prayer.authorName || 'Anonymous'}
        </div>
        
        <button 
          onClick={handlePray}
          disabled={hasPrayed}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
            hasPrayed 
            ? 'bg-[#FBE8E8] text-[#8B2323]' 
            : 'bg-[#F3EAE1] text-[#7A6150] hover:bg-[#E5D5C5]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${hasPrayed ? 'fill-current' : ''}`} />
          {hasPrayed ? 'Prayed' : 'Pray'} • {prayedCount}
        </button>
      </div>
    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
