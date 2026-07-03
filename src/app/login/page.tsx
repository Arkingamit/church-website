"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Church, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isNative, setIsNative] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
      setIsNative(true);
      try {
        GoogleAuth.initialize();
      } catch (e) {
        console.error("GoogleAuth init error:", e);
      }
    }

    // Check if super admin exists
    fetch('/api/setup')
      .then(res => res.json())
      .then(data => {
        if (!data.hasSuperAdmin) {
          router.push('/setup');
        }
      })
      .catch(console.error);
  }, [router]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    if (!credentialResponse.credential) {
      setError('Google authentication failed. No credential received.');
      return;
    }

    const result = await login(credentialResponse.credential);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  const handleNativeGoogleLogin = async () => {
    setError('');
    try {
      const response = await GoogleAuth.signIn();
      // response.authentication.idToken holds the JWT token needed
      if (!response.authentication?.idToken) {
        setError('Google authentication failed. No token received.');
        return;
      }
      const result = await login(response.authentication.idToken);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      console.error(err);
      setError('Native Google sign in failed or was cancelled.');
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background text-foreground">
      {/* Left Side: Premium Aesthetic Panel */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        {/* Elegant Dark Gradient */}
        <div className="absolute inset-0 bg-zinc-950 bg-gradient-to-b from-[#8B2323] via-zinc-950 to-zinc-950" />
        
        {/* Clean Mesh Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

        {/* Ambient Blurred Accents */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-red-800/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-20 flex items-center gap-2.5 font-medium text-lg font-serif">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Church className="w-5 h-5 text-white" />
          </div>
          <span className="tracking-wide">Grace Community</span>
        </div>

        {/* Quote */}
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg font-serif italic text-white/95 leading-relaxed">
              &ldquo;A welcoming community where faith grows, hearts connect, and lives are transformed through God&apos;s love.&rdquo;
            </p>
            <footer className="text-sm text-white/50 font-sans tracking-wide">
              — Grace Community Church
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side: Auth Card Container */}
      <div className="lg:p-8 flex items-center justify-center min-h-screen bg-transparent">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] px-4">
          <div className="flex flex-col space-y-2 text-center">
            {/* Mobile-Only Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Church className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account with Google
            </p>
          </div>

          <div className="grid gap-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-center w-full min-h-[50px] items-center">
              {!mounted ? (
                <div className="w-[342px] h-[40px] animate-pulse bg-muted rounded"></div>
              ) : isNative ? (
                <Button 
                  onClick={handleNativeGoogleLogin}
                  variant="outline"
                  className="w-[342px] h-[40px] text-[14px] font-medium border-[#dadce0] text-[#3c4043] rounded-[4px] gap-3 flex items-center justify-center hover:bg-[#f8f9fa] bg-white transition-colors"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-[18px] h-[18px]">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                  Sign in with Google
                </Button>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  text="signin_with"
                  width="342"
                />
              )}
            </div>
          </div>

          <p className="px-8 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary transition-colors font-medium">
              Register Here
            </Link>
          </p>

          <p className="text-center text-xs">
            <Link href="/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
