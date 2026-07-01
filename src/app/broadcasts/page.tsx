"use client";

import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, RefreshCw, User, Calendar } from 'lucide-react';

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/broadcasts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBroadcasts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF5F0] to-white pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#8B2323] to-[#5C1717] text-white px-6 pt-12 pb-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6" />
            <h1 className="text-3xl font-serif font-bold">Note Share</h1>
          </div>
          <p className="text-white/70 text-sm">Notes, materials, and resources from your leaders</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border">
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">No Notes Shared Yet</h3>
            <p className="text-muted-foreground text-sm">Check back later for notes and materials from your leaders.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {broadcasts.map(b => (
              <div
                key={b._id}
                className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <h2 className="text-xl font-bold text-[#1A202C] mb-1">{b.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {b.createdByName || 'Leader'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-wrap">{b.description}</p>

                  {b.materialLinks && b.materialLinks.length > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">📎 Materials & Resources</p>
                      {b.materialLinks.map((link: any, idx: number) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#F3EAE1] to-[#FAF5F0] hover:from-[#E8D5C4] hover:to-[#F3EAE1] transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-[#8B2323]/10 flex items-center justify-center shrink-0">
                            <ExternalLink className="w-4 h-4 text-[#8B2323]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#8B2323] group-hover:underline truncate">{link.label}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{link.url}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
