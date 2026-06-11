"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Church, QrCode, ScanLine, ArrowLeft } from 'lucide-react';
import { QRScanner } from '@/components/ui/qr-scanner';

export default function RegisterEntryPage() {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg mb-2">
            <Church className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Register to Grace</h1>
          <p className="text-muted-foreground text-lg">
            Registration is only available via campus-specific QR codes.
          </p>
        </div>

        {/* QR Entry Card */}
        <Card className="border-border/50 shadow-elevated overflow-hidden bg-card/50 backdrop-blur-xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto ring-1 ring-primary/20">
              <QrCode className="w-12 h-12 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Ready to Join?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Please scan the QR code located at your local campus registration desk or provided by a campus leader.
              </p>
            </div>

            <Button 
              size="lg" 
              className="w-full h-14 text-lg gap-3 shadow-lg shadow-primary/20 hover-lift"
              onClick={() => setShowScanner(true)}
            >
              <ScanLine className="w-6 h-6" />
              Scan Campus QR
            </Button>

            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </CardContent>
        </Card>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground/60 px-8 leading-relaxed">
          If you are unable to scan the code, please ask a campus leader for a direct registration link.
        </p>
      </div>

      {/* QR Scanner Overlay */}
      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
