'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Smartphone,
  Leaf,
  LogOut
} from 'lucide-react';

import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  onOpenMobileQr: () => void;
  onOpenImpact: () => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  totalActiveHazards: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileQr,
  onOpenImpact,
  activeFilter,
  setActiveFilter,
  totalActiveHazards
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-emerald-900/40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src="/logo.jpeg"
            alt="MyGovt AI Hub Logo"
            className="h-9 sm:h-10 w-auto object-contain rounded-xl shadow-xs"
          />
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            COMMAND CENTER
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE CLOUD SYNC
          </span>
        </div>

        {/* Center / Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Light / Dark Mode Toggle Button */}
          <ThemeToggle />

          {/* Impact Section Button (Opens Full Page Impact View) */}
          <button
            onClick={onOpenImpact}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 transition-all cursor-pointer shadow-xs"
            title="View Full-Page Environmental & Civic Impact"
          >
            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold">Impact</span>
          </button>

          {/* Mobile QR Button */}
          <button
            onClick={onOpenMobileQr}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs"
            title="Scan QR Code to open on mobile"
          >
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Mobile View</span>
          </button>

          {/* TOP RIGHT: ADMIN PROFILE WITH OUTSIDE LOGOUT BUTTON */}
          <div className="flex items-center gap-2">
            {/* Profile Info Pill */}
            <div className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                {(user?.name || 'K. S. Purushothaman').replace(/commissioner\s*/gi, '').trim().charAt(0) || 'K'}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[150px]">
                  {(user?.name || 'K. S. Purushothaman').replace(/commissioner\s*/gi, '').trim() || 'K. S. Purushothaman'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block">Municipal Admin</span>
              </div>
            </div>

            {/* Prominent Outside Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 transition-all cursor-pointer shadow-xs"
              title="Log Out of Session"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline font-bold">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
