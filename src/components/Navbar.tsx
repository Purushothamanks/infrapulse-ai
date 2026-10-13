'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Smartphone,
  Leaf,
  LogOut,
  ShieldCheck
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
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-emerald-900/40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src="/logo.png"
            alt="MyGovt AI Hub Logo"
            className="h-8 sm:h-10 w-auto object-contain rounded-xl shadow-xs shrink-0"
          />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase truncate">
              MY GOVT AI HUB
            </span>
          </div>
        </div>

        {/* Action Buttons & Admin Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* Impact Dashboard Button */}
          <button
            onClick={onOpenImpact}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 transition-all cursor-pointer shadow-xs"
            title="View Full-Page Environmental & Civic Impact"
          >
            <Leaf className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold hidden xs:inline sm:inline">Impact</span>
          </button>

          {/* Mobile QR Button (Hidden on Mobile Screens) */}
          <button
            onClick={onOpenMobileQr}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs"
            title="Scan QR Code to open on mobile device"
          >
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Mobile QR</span>
          </button>

          {/* Admin Profile Tag */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xs">
            <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="inline sm:hidden">Admin</span>
              <span className="hidden sm:inline">Municipal Admin</span>
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 transition-all cursor-pointer shadow-xs"
            title="Log Out of Session"
          >
            <LogOut className="w-4 h-4 text-red-500 shrink-0" />
            <span className="hidden sm:inline font-bold">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
