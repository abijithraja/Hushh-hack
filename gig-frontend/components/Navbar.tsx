'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/NotificationBell';

export default function Navbar() {
  const pathname = usePathname();
  const { signOut, profile, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut();
  };

  const navLinks = [
    { href: '/dashboard', label: 'Home' },
    { href: '/my-gigs', label: 'My Gigs' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/profile', label: 'Profile' },
  ];

  const displayName = profile?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">

          {/* Left: Logo + Desktop links */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex-shrink-0">
              <span className="text-lg font-bold text-[#0F172A]">
                Skill<span className="text-blue-600">Gig</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Desktop actions + Burger */}
          <div className="flex items-center gap-3">
            {/* Search - desktop only */}
            <div className="hidden md:flex items-center border border-slate-200 bg-slate-50 rounded-lg px-3 py-1.5 gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search gigs..."
                className="bg-transparent text-sm outline-none w-44 text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Post Gig - desktop only */}
            <Link
              href="/post"
              className="hidden md:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
            >
              <span className="text-base leading-none">+</span> Post Gig
            </Link>

            <NotificationBell />

            {/* Desktop logout */}
            <button
              onClick={handleLogout}
              className="hidden md:block text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Logout
            </button>

            {/* Burger - mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors gap-1.5"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-lg">
          {/* User badge */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-800 truncate">{displayName}</span>
          </div>

          {/* Nav links */}
          <div className="py-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile actions */}
          <div className="border-t border-slate-100 py-2 px-4 flex flex-col gap-2">
            <Link
              href="/post"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              <span className="text-base leading-none">+</span> Post a Gig
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-red-600 transition-colors py-2 text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
