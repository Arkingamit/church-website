"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Calendar, Clock, Heart, MapPin, Sparkles, Users } from 'lucide-react';

export const HeroSection = () => {
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
          <Card className="glass-card p-8 max-w-md hover-lift floating shadow-2xl border-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                  Daily Bible Verse
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold italic text-primary">
                  "The Lord is my shepherd; I shall not want."
                </h3>
                <p className="text-muted-foreground text-right">— Psalm 23:1</p>
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
        </div>

        </div>
      </div>
    </section>
  );
};