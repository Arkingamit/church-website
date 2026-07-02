"use client";

import React from "react";
import { HeroSection } from "@/components/ui/hero-section";
import { AnnouncementsSection } from "@/components/ui/announcements-section";
import { PrayerWall } from "@/components/ui/prayer-wall";
import { EventsSection } from "@/components/ui/events-section";
import { GallerySection } from "@/components/ui/gallery-section";
import { LiveStreamSection } from "@/components/ui/live-stream";
import { SongCarousel } from "@/components/ui/song-carousel";
import { CampusDetails } from "@/components/ui/campus-details";
import { SermonsPreview } from "@/components/ui/sermons-preview";
import { useParallax, useScrollReveal } from "@/lib/use-parallax";
import { MobileHomeView } from "@/components/home/mobile-home-view";

// Wrapper for parallax background sections
function ParallaxSection({
  children,
  speed = 0.3,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const { ref, offset } = useParallax(speed);
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Parallax background layer */}
      <div
        className="absolute inset-0 -top-20 -bottom-20 pointer-events-none"
        style={{
          transform: `translateY(${offset}px)`,
          willChange: 'transform',
        }}
      >
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Wrapper for scroll-reveal animations
function RevealSection({
  children,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const { ref, isVisible } = useScrollReveal(0.1);

  const directionStyles = {
    up: "translate-y-12",
    left: "translate-x-12",
    right: "-translate-x-12",
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible
          ? "opacity-100 translate-y-0 translate-x-0"
          : `opacity-0 ${directionStyles[direction]}`
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-transparent selection:bg-primary/10 flex flex-col">
      
      {/* Mobile Custom View (Hidden on Desktop) */}
      <MobileHomeView />

      {/* Desktop Original View (Hidden on Mobile) */}
      <div className="hidden md:flex flex-col">
        {/* 1. Highlights (Hero) */}
        <ParallaxSection speed={0.15} className="min-h-screen flex flex-col justify-center border-b border-border/50 relative">
          <HeroSection />
        </ParallaxSection>

        {/* 2. Announcements */}
        <section className="bg-transparent relative z-10 py-24 sm:py-32 border-b border-border/50">
          <RevealSection delay={300}>
            <AnnouncementsSection preview={true} />
          </RevealSection>
        </section>

        {/* 3. Upcoming Events */}
        <section className="bg-transparent relative z-10 py-24 sm:py-32 border-b border-border/50">
          <RevealSection delay={50}>
            <EventsSection />
          </RevealSection>
        </section>

        {/* 4. Prayer Wall */}
        <ParallaxSection speed={0.25} className="bg-transparent py-24 sm:py-32 border-b border-border/50 relative">
          <RevealSection delay={100}>
            <PrayerWall />
          </RevealSection>
        </ParallaxSection>

        {/* 5. Sermon */}
        <ParallaxSection speed={0.2} className="bg-transparent py-24 sm:py-32 border-b border-border/50 relative">
          <RevealSection delay={50}>
            <SermonsPreview />
          </RevealSection>
        </ParallaxSection>

        {/* 6. Music Videos */}
        <section className="bg-transparent relative z-10 py-24 sm:py-32 border-b border-border/50">
          <RevealSection>
            <SongCarousel />
          </RevealSection>
        </section>

        {/* 7. Photo Gallery */}
        <ParallaxSection speed={0.2} className="bg-transparent py-24 sm:py-32 border-b border-border/50 relative">
          <RevealSection delay={100}>
            <GallerySection />
          </RevealSection>
        </ParallaxSection>

        {/* 8. Live Worship */}
        <ParallaxSection speed={0.2} className="bg-transparent py-24 sm:py-32 border-b border-border/50 relative">
          <RevealSection delay={100}>
            <LiveStreamSection />
          </RevealSection>
        </ParallaxSection>

        {/* 9. Your Campus Location */}
        <section className="bg-transparent relative z-10 py-24 sm:py-32">
          <RevealSection delay={50}>
            <CampusDetails />
          </RevealSection>
        </section>
      </div>

    </div>
  );
}
