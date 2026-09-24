'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  PlusCircle,
  Activity,
  Smartphone,
  Leaf,
  LogOut,
  ChevronDown
} from 'lucide-react';

import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  onOpenReport: () => void;
  onOpenMobileQr: () => void;
  onOpenImpact: () => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  totalActiveHazards: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReport,
  onOpenMobileQr,
  onOpenImpact,
  activeFilter,
  setActiveFilter,
  totalActiveHazards
}) => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-emerald-900/40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-md shadow-emerald-500/20 text-slate-950 font-black shrink-0">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                InfraPulse<span className="text-emerald-500 dark:text-emerald-400 font-mono">.AI</span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                COMMAND CENTER
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block truncate">
              Municipal Urban Infrastructure Triage & Sustainable Action
            </p>
          </div>
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

          {/* Citizen Report Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span className="font-bold hidden sm:inline">Report Hazard</span>
            <span className="font-bold sm:hidden">Report</span>
          </button>

          {/* TOP RIGHT: ADMIN PROFILE WITH LOGOUT DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[120px]">
                  {user?.name || 'Admin Official'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block">Municipal Admin</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            {/* Profile Dropdown Menu (Only User Info + Logout) */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                    <span>VERIFIED OFFICIAL</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-semibold">Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
