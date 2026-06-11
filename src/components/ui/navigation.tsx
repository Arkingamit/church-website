"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Heart, Calendar, Camera, Play, Users, Menu, X, Volume2, LogOut, User, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Disperse (hide) when scrolling down, show when scrolling up or near top
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsScrolledDown(true);
      } else {
        setIsScrolledDown(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const { session, logout } = useAuth();
  const router = useRouter();

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Events', href: '#events', icon: Calendar },
    { label: 'Sermons', href: '/sermons', icon: Play },
    { label: 'Music', href: '/music', icon: Volume2 },
    { label: 'Gallery', href: '#gallery', icon: Camera },
    { label: 'Prayer Wall', href: '#prayers', icon: Heart },
  ];

  const isPageRoute = (href: string) => href.startsWith('/');

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav 
      className={`sticky top-0 z-50 glass border-b border-glass-border transition-all duration-300 ease-in-out ${
        isScrolledDown ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4 group cursor-pointer">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
              <img
                src="/logo.png"
                alt="Grace Ahmedabad Logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Grace Ahmedabad</h1>
              <p className="text-sm text-muted-foreground font-medium">Where hearts unite</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) =>
              isPageRoute(item.href) ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 relative"
                >
                  {item.icon && <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />}
                  <span className="text-sm font-semibold">{item.label}</span>
                  <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 relative"
                >
                  {item.icon && <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />}
                  <span className="text-sm font-semibold">{item.label}</span>
                  <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </a>
              )
            )}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/admin" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              Admin
            </Link>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{getInitials(session.name)}</span>
                  </div>
                  <span className="text-sm font-semibold max-w-[100px] truncate">{session.name}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 py-1 rounded-xl border border-border bg-card shadow-elevated z-50">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-xs text-muted-foreground truncate">{session.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-muted/50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="glass" size="sm" className="hover-lift">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="space-y-3">
              {navItems.map((item) =>
                isPageRoute(item.href) ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span className="font-medium">{item.label}</span>
                  </a>
                )
              )}
              <div className="pt-4 border-t border-border space-y-2">
                {session ? (
                  <>
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{getInitials(session.name)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{session.name}</p>
                        <p className="text-xs text-muted-foreground">{session.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};