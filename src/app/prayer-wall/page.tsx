"use client";

import React from "react";
import { Navigation } from "@/components/ui/navigation";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { PrayerWall } from "@/components/ui/prayer-wall";

export default function PrayerWallPage() {
  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-12 text-[#3A2D27]">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 md:px-8">
        <PrayerWall variant="page" />
      </main>
      <MobileBottomNav />
    </div>
  );
}
