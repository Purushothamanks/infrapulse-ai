'use client';

import React from 'react';
import { Map, ListFilter, BarChart2, Smartphone } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'map' | 'queue' | 'stats';
  setCurrentTab: (tab: 'map' | 'queue' | 'stats') => void;
  onOpenMobileQr: () => void;
  queueCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenMobileQr,
  queueCount
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/80 px-2 pt-1.5 pb-3 transition-colors shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Map Tab */}
        <button
          onClick={() => setCurrentTab('map')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3.5 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            currentTab === 'map'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">GIS Map</span>
        </button>

        {/* Incident Queue Tab */}
        <button
          onClick={() => setCurrentTab('queue')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3.5 rounded-2xl transition-all cursor-pointer relative active:scale-95 ${
            currentTab === 'queue'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ListFilter className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-mono font-bold shadow-xs">
              {queueCount}
            </span>
          </div>
          <span className="text-[10px] font-semibold tracking-wide">Queue</span>
        </button>

        {/* Stats / Impact Tab */}
        <button
          onClick={() => setCurrentTab('stats')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3.5 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            currentTab === 'stats'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">Impact</span>
        </button>

        {/* Mobile QR Share Tab */}
        <button
          onClick={onOpenMobileQr}
          className="flex flex-col items-center justify-center gap-1 py-1.5 px-3.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all cursor-pointer active:scale-95"
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">Share</span>
        </button>
      </div>
    </nav>
  );
};
