"use client";

import React from "react";
import { Navigation } from "@/components/ui/navigation";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { GallerySection } from "@/components/ui/gallery-section";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 md:pb-12 text-[#3A2D27] selection:bg-primary/20">
      <GallerySection variant="page" />
      <MobileBottomNav />
    </div>
  );
}
