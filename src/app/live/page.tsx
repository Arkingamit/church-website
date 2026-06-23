"use client";

import React, { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { Card } from "@/components/ui/card";
import { PlayCircle, Clock, Calendar, MessageSquare, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LivePage() {
  const [isLive, setIsLive] = useState(false); // Toggle this to true to show the video player

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 md:pb-12 text-[#3A2D27] selection:bg-[#8B2323]/20">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex h-4 w-4">
            {isLive ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-4 w-4 bg-gray-400"></span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1A202C]">
            {isLive ? "Live Now" : "Upcoming Stream"}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-black rounded-3xl relative">
              {isLive ? (
                <div className="aspect-video w-full bg-black relative">
                  {/* Embedded Player (YouTube / Vimeo) */}
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/live_stream?channel=UCUZHFZ9jIKrLroW8LcyJEQQ" 
                    title="Grace Community Live Stream" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute inset-0"
                  ></iframe>
                </div>
              ) : (
                <div className="aspect-video w-full bg-[#3A2D27] relative flex flex-col items-center justify-center text-center p-6">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                  <PlayCircle className="w-16 h-16 text-white/20 mb-4" />
                  <h3 className="text-2xl font-serif text-white mb-2">Service has ended</h3>
                  <p className="text-white/60 mb-6">Join us next Sunday at 9:00 AM</p>
                  <Button className="bg-[#8B2323] hover:bg-[#6b1b1b] text-white rounded-full px-8">
                    Set Reminder
                  </Button>
                </div>
              )}
            </Card>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white">
              <h2 className="text-xl font-bold text-[#1A202C] mb-2">Sunday Worship Experience</h2>
              <p className="text-[#7A6150] mb-4">Join us as we worship together and hear a powerful message from Pastor John.</p>
              
              <div className="flex flex-wrap gap-4 text-sm font-semibold text-[#8B2323]">
                <div className="flex items-center gap-2 bg-[#FBE8E8] px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4" /> Sundays
                </div>
                <div className="flex items-center gap-2 bg-[#FBE8E8] px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" /> 9:00 AM & 11:30 AM
                </div>
              </div>
            </div>
          </div>

          {/* Chat / Interaction Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full min-h-[400px] flex flex-col border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden">
              <div className="p-4 border-b border-[#F3EAE1] bg-white/40 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#8B2323]" />
                <h3 className="font-bold text-[#1A202C]">Live Chat</h3>
              </div>
              
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#F3EAE1] rounded-full flex items-center justify-center mb-2">
                  <Heart className="w-8 h-8 text-[#8B2323]" />
                </div>
                <h4 className="font-bold text-[#3A2D27]">Chat is offline</h4>
                <p className="text-sm text-[#7A6150]">The live chat will be available 15 minutes before the service begins. We can't wait to connect with you!</p>
              </div>
              
              <div className="p-4 bg-[#FAF7F2] border-t border-[#F3EAE1]">
                <div className="w-full bg-white border border-[#E5D5C5] rounded-full px-4 py-3 text-sm text-[#a59d94] cursor-not-allowed flex items-center">
                  Chat disabled...
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
