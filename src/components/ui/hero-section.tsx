"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Calendar, Clock, Heart, MapPin, Sparkles, Users, ArrowRight, Bell } from 'lucide-react';
import { useAdminData, type FlipCardItem } from '@/lib/admin-data-context';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

export const HeroSection = () => {
  const { flipCardConfig, events, announcements, sermons, worshipVideos, prayerRequests } = useAdminData();

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

  const [verse, setVerse] = useState({
    text: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1"
  });

  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetch('/api/verses/today')
      .then(res => res.json())
      .then(data => {
        if (data && data.text) setVerse(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (flipCardConfig.isActive) {
      const timer = setTimeout(() => {
        setIsFlipped(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsFlipped(false);
    }
  }, [flipCardConfig.isActive]);

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Advanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-prayer/5" />
      <div className="absolute inset-0" style={{ backgroundImage: 'var(--gradient-mesh)' }} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-6 animate-slide-up">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                Welcome to{' '}
                <span className="gradient-text animate-gradient-shift">
                  Grace Community
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                A place where faith grows, hearts connect, and lives are transformed. 
                Join our vibrant community in worship, fellowship, and service.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button variant="gradient" size="xl" className="hover-lift shadow-2xl">
                Join Us Sunday
              </Button>
              <Button variant="glass" size="xl" className="hover-lift">
                Watch Live
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-bold gradient-text group-hover:scale-110 transition-transform duration-300">2,500+</div>
                <div className="text-sm font-semibold text-muted-foreground mt-2">Members</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-bold gradient-text group-hover:scale-110 transition-transform duration-300">25+</div>
                <div className="text-sm font-semibold text-muted-foreground mt-2">Small Groups</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-bold gradient-text group-hover:scale-110 transition-transform duration-300">15</div>
                <div className="text-sm font-semibold text-muted-foreground mt-2">Years Serving</div>
              </div>
            </div>
          </div>

          {/* Featured Event Card */}
        <div className="lg:justify-self-end animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="group perspective-1000 floating">
            <div className={`relative w-full max-w-md mx-auto transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              
              {/* FRONT: Daily Bible Verse */}
              <Card className="glass-card p-8 backface-hidden shadow-2xl border-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                      Daily Bible Verse
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold italic text-primary">
                      "{verse.text}"
                    </h3>
                    <p className="text-muted-foreground text-right">— {verse.reference}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>Take a moment to reflect</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Heart className="w-4 h-4 text-primary" />
                      <span>Keep this verse close today</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Share God’s Word</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="gradient" className="w-full hover-lift">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read More
                    </Button>
                  </div>
                </div>
              </Card>

              {/* BACK: Admin Custom Flip Content */}
              {flipCardConfig.isActive && flipCardConfig.items?.length > 0 && (
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                  <Swiper
                    effect={'cards'}
                    grabCursor={true}
                    loop={true}
                    cardsEffect={{
                      slideShadows: false,
                    }}
                    modules={[EffectCards, Autoplay]}
                    className="w-full h-full"
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                    }}
                  >
                    {flipCardConfig.items.map((item, index) => {
                      const { displayTitle, displayDesc, displayBtn, displayLink } = getDisplayDetails(item);
                      return (
                        <SwiperSlide key={item.id || index}>
                          <Card className="glass-card p-8 w-full h-full shadow-2xl border-0 flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
                            <div className="space-y-6 w-full">
                              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                                <Bell className="w-8 h-8 text-primary animate-pulse" />
                              </div>
                              
                              <h3 className="text-3xl font-bold text-foreground">
                                {displayTitle}
                              </h3>
                              
                              <p className="text-muted-foreground text-lg px-2 line-clamp-3">
                                {displayDesc}
                              </p>

                              <div className="pt-6">
                                <Button variant="gradient" size="lg" className="w-full hover-lift shadow-lg group/btn" asChild>
                                  <Link href={displayLink}>
                                    {displayBtn} 
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                </div>
              )}

            </div>
          </div>
        </div>

        </div>
      </div>
    </section>
  );
};