"use client";

import React, { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { Card } from "@/components/ui/card";
import { Heart, User, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAdminData } from "@/lib/admin-data-context";
import { useAuth } from "@/lib/auth-context";

export default function PrayerWallPage() {
  const { prayerRequests, refreshData } = useAdminData();
  const { session } = useAuth();
  
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          isAnonymous,
          authorId: session?.userId,
          authorName: session?.user?.name,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setContent("");
        setIsAnonymous(false);
        // Refresh global data
        setTimeout(() => refreshData(), 2000);
      }
    } catch (err) {
      console.error("Failed to submit prayer", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 md:pb-12 text-[#3A2D27]">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1A202C] mb-4">Prayer Wall</h1>
          <p className="text-[#7A6150] max-w-2xl mx-auto text-lg">
            Bear one another's burdens, and so fulfill the law of Christ. Share your prayer requests, and let our community pray with you.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          
          {/* Submit Prayer Form */}
          <div className="md:col-span-2">
            <div className="sticky top-24">
              <Card className="p-6 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-sm rounded-3xl">
                <h2 className="text-xl font-bold text-[#1A202C] mb-4">Submit a Request</h2>
                
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center text-center py-8"
                    >
                      <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Prayer Shared</h3>
                      <p className="text-sm text-[#7A6150] mb-6">Your prayer request has been submitted to the community.</p>
                      <Button variant="outline" onClick={() => setSubmitted(false)}>
                        Submit Another
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit} 
                      className="space-y-4"
                    >
                      <div>
                        <textarea 
                          className="w-full bg-[#FAF7F2] border border-[#E5D5C5] rounded-2xl p-4 text-[#3A2D27] placeholder:text-[#a59d94] focus:outline-none focus:ring-2 focus:ring-[#8B2323]/20 resize-none"
                          rows={5}
                          placeholder="How can we pray for you?"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 px-1">
                        <input 
                          type="checkbox" 
                          id="anonymous" 
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded text-[#8B2323] focus:ring-[#8B2323]"
                        />
                        <label htmlFor="anonymous" className="text-sm text-[#7A6150] cursor-pointer">
                          Post anonymously
                        </label>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting || !content.trim()}
                        className="w-full bg-[#8B2323] hover:bg-[#6b1b1b] text-white rounded-xl py-6 font-semibold"
                      >
                        {isSubmitting ? "Submitting..." : (
                          <span className="flex items-center gap-2">
                            Share Prayer <Send className="w-4 h-4" />
                          </span>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </div>

          {/* Community Prayers Feed */}
          <div className="md:col-span-3 space-y-4">
            <h2 className="text-2xl font-serif font-bold text-[#1A202C] mb-6 border-l-4 border-[#8B2323] pl-3 py-0.5 leading-none">
              Community Prayers
            </h2>
            
            {prayerRequests
              .filter(p => p.status === "approved" || p.status === undefined)
              .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
              .map((prayer) => (
                <PrayerCard key={prayer.id} prayer={prayer} session={session} />
              ))
            }

            {prayerRequests.length === 0 && (
              <div className="text-center py-12 bg-white/40 rounded-3xl border border-[#F3EAE1] border-dashed">
                <Heart className="w-12 h-12 text-[#E5D5C5] mx-auto mb-3" />
                <p className="text-[#7A6150]">No prayer requests at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}

// Reuse the same PrayerCard logic from mobile-home-view
function PrayerCard({ prayer, session }: { prayer: any, session: any }) {
  const [prayedCount, setPrayedCount] = useState(prayer.prayedCount || 0);
  const [hasPrayed, setHasPrayed] = useState(
    prayer.prayedBy && session && prayer.prayedBy.includes(session.userId)
  );

  const handlePray = async () => {
    if (hasPrayed) return;
    
    setHasPrayed(true);
    setPrayedCount((prev: number) => prev + 1);

    try {
      const res = await fetch(`/api/prayers/${prayer.id}/pray`, { method: 'POST' });
      if (!res.ok) {
        setHasPrayed(false);
        setPrayedCount((prev: number) => prev - 1);
      }
    } catch (err) {
      setHasPrayed(false);
      setPrayedCount((prev: number) => prev - 1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white shadow-sm"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-[#8B2323] tracking-wider uppercase bg-[#FBE8E8] px-2 py-1 rounded-sm">
          {new Date(prayer.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      <p className="text-[#3A2D27] leading-relaxed mb-4 whitespace-pre-wrap">{prayer.content}</p>
      
      <div className="flex items-center justify-between border-t border-[#F3EAE1] pt-4">
        <div className="flex items-center text-sm font-semibold text-[#8B2323]">
          <User className="w-4 h-4 mr-2" />
          {prayer.isAnonymous ? "Anonymous" : (prayer.authorName || 'Anonymous')}
        </div>
        
        <button 
          onClick={handlePray}
          disabled={hasPrayed}
          className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition-colors ${
            hasPrayed 
            ? 'bg-[#FBE8E8] text-[#8B2323]' 
            : 'bg-[#F3EAE1] text-[#7A6150] hover:bg-[#E5D5C5] active:scale-95'
          }`}
        >
          <Heart className={`w-4 h-4 ${hasPrayed ? 'fill-current' : ''}`} />
          {hasPrayed ? 'Prayed' : 'Pray'} • {prayedCount}
        </button>
      </div>
    </motion.div>
  );
}
