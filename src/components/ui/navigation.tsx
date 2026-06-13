"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LogOut, User } from 'lucide-react';

const AnimatedNavLink = ({ href, children, isPageRoute }: { href: string; children: React.ReactNode; isPageRoute?: boolean }) => {
  const defaultTextColor = 'text-gray-300';
  const hoverTextColor = 'text-white';
  const textSizeClass = 'text-sm';

  const content = (
    <div className={`group relative overflow-hidden h-5 flex items-start ${textSizeClass}`}>
      <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className={`${defaultTextColor} h-5 flex items-center`}>{children}</span>
        <span className={`${hoverTextColor} h-5 flex items-center`}>{children}</span>
      </div>
    </div>
  );

  if (isPageRoute) {
    return <Link href={href} className="flex">{content}</Link>;
  }

  return <a href={href} className="flex">{content}</a>;
};

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Existing scroll hiding state
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Existing auth state
  const { session, logout } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass('rounded-2xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const navLinksData = [
   
    { label: 'Events', href: '#events' },
    { label: 'Sermons', href: '/sermons' },
    { label: 'Music', href: '/music' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Prayer Wall', href: '#prayers' },
    { label: 'About', href: '#about' },
  ];

  const isPageRoute = (href: string) => href.startsWith('/');

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setIsOpen(false);
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const logoElement = (
    <Link href="/" className="flex items-center space-x-2 group cursor-pointer mr-auto sm:mr-22">
      <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center">
        <img
          src="/logo.png"
          alt="Grace Ahmedabad Logo"
          className="w-12 h-12 sm:w-16 sm:h-16 object-contain opacity-90"
        />
      </div>
    </Link>
  );

  const loginButtonElement = (
    <Link href="/login" className="w-full sm:w-auto">
      <button className="px-4 py-2 sm:px-4 text-xs sm:text-sm font-medium border border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-300 rounded-full hover:border-white/50 hover:text-white transition-colors duration-200 w-full">
        Sign In
      </button>
    </Link>
  );

  const signupButtonElement = (
    <Link href="/register" className="w-full sm:w-auto">
      <div className="relative group w-full sm:w-auto">
        <div className="absolute inset-0 -m-2 rounded-full hidden sm:block bg-gray-100 opacity-40 filter blur-lg pointer-events-none transition-all duration-300 ease-out group-hover:opacity-60 group-hover:blur-xl group-hover:-m-3"></div>
        <button className="relative z-10 px-4 py-2 sm:px-3 text-xs sm:text-sm font-semibold text-black bg-gradient-to-br from-gray-100 to-gray-300 rounded-full hover:from-gray-200 hover:to-gray-400 transition-all duration-200 w-full">
          Signup
        </button>
      </div>
    </Link>
  );

  const userDropdownElement = session ? (
    <div className="relative">
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-[#333] bg-[rgba(31,31,31,0.62)] hover:border-white/50 transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
          <span className="text-[9px] font-bold text-black">{getInitials(session.name)}</span>
        </div>
        <span className="text-sm font-medium text-gray-200 hidden sm:block max-w-[80px] truncate">{session.name.split(' ')[0]}</span>
      </button>
      {userMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-3 w-48 py-1 rounded-xl border border-[#333] bg-[#1f1f1f] shadow-2xl z-50 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-[#333] bg-white/5">
              <p className="text-xs text-gray-400 truncate">{session.email}</p>
            </div>
            {(session.role === 'admin' || session.role === 'super_admin' || session.role === 'campus_leader') && (
              <Link
                href="/admin"
                onClick={() => setUserMenuOpen(false)}
                className="w-full flex items-center px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
              >
                Admin Panel
              </Link>
            )}
            <Link
              href="/profile"
              onClick={() => setUserMenuOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
            >
              <User className="w-4 h-4" /> Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  ) : null;

  return (
    <header className={`fixed top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-50
                       flex flex-col items-center
                       px-5 sm:px-10 py-2 sm:py-3 backdrop-blur-md shadow-2xl
                       ${headerShapeClass}
                       border border-[#333] bg-[#1f1f1f99] md:bg-[#1f1f1f57]
                       w-[calc(100%-1.5rem)] md:w-auto md:min-w-[700px] lg:min-w-[900px]
                       transition-[border-radius,transform,opacity] duration-300 ease-in-out
                       ${isScrolledDown ? '-translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'}`}>

      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-10">
        <div className="flex items-center">
           {logoElement}
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href} isPageRoute={isPageRoute(link.href)}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4 ml-auto">
          {session ? (
            userDropdownElement
          ) : (
            <>
              {loginButtonElement}
              {signupButtonElement}
            </>
          )}
        </div>

        <button className="md:hidden flex items-center justify-center w-10 h-10 text-gray-300 hover:text-white hover:bg-white/10 rounded-full focus:outline-none ml-auto transition-colors" onClick={toggleMenu} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
          {isOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Content */}
      <div className={`md:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                       ${isOpen ? 'max-h-[600px] opacity-100 pt-4 pb-2' : 'max-h-0 opacity-0 pt-0 pb-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-1 w-full border-t border-white/10 pt-4 mt-2">
          {navLinksData.map((link) => {
            const content = <span className="text-gray-300 hover:text-white hover:bg-white/10 rounded-xl py-3.5 transition-colors w-full text-center font-medium block text-lg">{link.label}</span>;
            return isPageRoute(link.href) ? (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="w-full px-2">{content}</Link>
            ) : (
              <a key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="w-full px-2">{content}</a>
            );
          })}
        </nav>
        <div className="flex flex-col items-center space-y-3 mt-4 w-full border-t border-white/10 pt-6 px-4">
          {session ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-black">{getInitials(session.name)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{session.name}</span>
                  <span className="text-xs text-gray-400">{session.email}</span>
                </div>
              </div>
              {(session.role === 'admin' || session.role === 'super_admin' || session.role === 'campus_leader') && (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="w-full">
                  <button className="w-full py-2.5 text-sm font-medium border border-[#333] bg-white/5 text-gray-300 rounded-xl hover:text-white transition-colors">Admin Panel</button>
                </Link>
              )}
              <Link href="/profile" onClick={() => setIsOpen(false)} className="w-full">
                <button className="w-full py-2.5 text-sm font-medium border border-[#333] bg-white/5 text-gray-300 rounded-xl hover:text-white transition-colors">Profile</button>
              </Link>
              <button onClick={handleLogout} className="w-full py-2.5 text-sm font-medium border border-red-900/50 bg-red-900/20 text-red-400 rounded-xl hover:bg-red-900/40 transition-colors">Sign Out</button>
            </>
          ) : (
            <>
              {loginButtonElement}
              {signupButtonElement}
            </>
          )}
        </div>
      </div>
    </header>
  );
};