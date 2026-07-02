"use client";

import React from "react";
import { Navigation } from "@/components/ui/navigation";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { AnnouncementsSection } from "@/components/ui/announcements-section";

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-12 text-[#3A2D27]">
      <Navigation />
      <div className="pt-16">
        <AnnouncementsSection />
      </div>
      <MobileBottomNav />
    </div>
  );
}
