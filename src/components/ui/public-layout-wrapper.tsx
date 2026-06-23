"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/ui/navigation";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { Footer } from "@/components/ui/footer";

export function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Do not render the public Navigation and Footer on Admin pages
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div 
      className="flex min-h-screen flex-col bg-[#FAF7F2] md:bg-background overflow-x-hidden"
      style={{
        backgroundImage: 'var(--bg-pattern)',
        backgroundRepeat: 'repeat',
        backgroundSize: '240px 240px'
      }}
    >
      <div className="hidden md:block">
        <Navigation />
      </div>
      <main key={pathname} className="flex-1 pb-20 md:pb-0 animate-page-enter">{children}</main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
}
