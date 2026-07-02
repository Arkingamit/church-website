"use client";

import React from "react";
import { Navigation } from "@/components/ui/navigation";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { EventsSection } from "@/components/ui/events-section";

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-12 text-[#3A2D27]">
      <Navigation />
      <EventsSection variant="page" />
      <MobileBottomNav />
    </div>
  );
}
