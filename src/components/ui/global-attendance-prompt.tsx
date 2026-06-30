"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function GlobalAttendancePrompt() {
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Don't run on the explicit check-in page or admin pages
    if (pathname?.includes('/check-in') || pathname?.includes('/admin')) return;

    const checkActiveSessions = async () => {
      try {
        const res = await fetch('/api/attendance/active');
        if (!res.ok) return;
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // Find first session not already processed today
          const today = new Date().toDateString();
          const processed = JSON.parse(localStorage.getItem('processedAttendance') || '{}');
          
          const session = data.find(s => {
            const key = `${s._id}-${today}`;
            return !processed[key];
          });

          if (session) {
            setActiveSession(session);
            
            // Automatically ask for location and try to check in silently
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  try {
                    const res = await fetch('/api/attendance/check-in', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: session._id,
                        type: session.type || 'session',
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                      })
                    });
                    
                    if (res.ok) {
                      // Silently mark as checked in locally
                      const newProcessed = { ...processed, [`${session._id}-${today}`]: 'checked-in' };
                      localStorage.setItem('processedAttendance', JSON.stringify(newProcessed));
                    }
                  } catch (e) {
                    // Silently fail
                  }
                },
                (error) => {
                  // Silently fail if location denied
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
              );
            }
          }
        }
      } catch (error) {
        // Silently fail
      }
    };

    checkActiveSessions();
  }, [pathname]);

  // Completely invisible component, runs silently in the background
  return null;
}
