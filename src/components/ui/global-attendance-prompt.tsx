"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';

export function GlobalAttendancePrompt() {
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [success, setSuccess] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show on the explicit check-in page or admin pages
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
            
            // Automatically ask for location and try to check in
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
                      setSuccess(true);
                      setIsVisible(true); // Show success banner briefly
                      
                      const newProcessed = { ...processed, [`${session._id}-${today}`]: 'checked-in' };
                      localStorage.setItem('processedAttendance', JSON.stringify(newProcessed));
                      
                      setTimeout(() => setIsVisible(false), 4000);
                    } else {
                      // If out of range, show the manual prompt
                      setIsVisible(true);
                    }
                  } catch (e) {
                    setIsVisible(true);
                  }
                },
                (error) => {
                  // If location denied or failed, show the manual prompt banner
                  setIsVisible(true);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
              );
            } else {
              setIsVisible(true);
            }
          }
        }
      } catch (error) {
        console.error("Failed to check active sessions", error);
      }
    };

    checkActiveSessions();
  }, [pathname]);

  const markProcessed = (status: 'checked-in' | 'dismissed') => {
    if (!activeSession) return;
    const today = new Date().toDateString();
    const key = `${activeSession._id}-${today}`;
    const processed = JSON.parse(localStorage.getItem('processedAttendance') || '{}');
    processed[key] = status;
    localStorage.setItem('processedAttendance', JSON.stringify(processed));
  };

  const handleDismiss = () => {
    setIsVisible(false);
    markProcessed('dismissed');
  };

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsCheckingIn(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch('/api/attendance/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: activeSession._id,
              type: activeSession.type || 'session',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          });
          
          const data = await res.json();
          
          if (res.ok) {
            setSuccess(true);
            markProcessed('checked-in');
            toast.success("Checked in successfully!");
            setTimeout(() => setIsVisible(false), 3000);
          } else {
            toast.error(data.message || data.error);
            setIsCheckingIn(false);
          }
        } catch (e) {
          toast.error("Failed to connect to server");
          setIsCheckingIn(false);
        }
      },
      (error) => {
        setIsCheckingIn(false);
        let msg = "Failed to get location.";
        if (error.code === 1) msg = "Location permission denied. Please enable GPS.";
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (!activeSession || !isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 z-50 transition-transform duration-500 ease-out translate-y-0 md:bottom-6 md:left-auto md:right-6 md:w-96`}>
      <div className="bg-white/95 backdrop-blur-md border border-[#E5D5C5] shadow-2xl rounded-2xl p-5 relative overflow-hidden">
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#8B2323]" />
        
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#8B2323]/10 flex items-center justify-center shrink-0 mt-1">
            <MapPin className="w-5 h-5 text-[#8B2323]" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-[#1A202C] text-lg pr-6">
              {success ? "You're Checked In!" : activeSession.title}
            </h3>
            
            {success ? (
              <div className="flex items-center text-green-700 text-sm mt-1 font-medium">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Your attendance has been recorded.
              </div>
            ) : (
              <>
                <p className="text-sm text-[#7A6150] mt-1 leading-relaxed">
                  We noticed there's an ongoing service. Would you like to share your location to check in?
                </p>
                
                <div className="mt-4 flex gap-3">
                  <Button 
                    onClick={handleCheckIn}
                    disabled={isCheckingIn}
                    className="flex-1 bg-[#8B2323] hover:bg-[#721515] text-white rounded-xl shadow-md transition-all font-semibold"
                  >
                    {isCheckingIn ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                    ) : (
                      "Check In Now"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
