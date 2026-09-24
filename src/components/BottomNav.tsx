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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 py-2 safe-area-pb transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Map Tab */}
        <button
          onClick={() => setCurrentTab('map')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentTab === 'map'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px]">Map</span>
        </button>

        {/* Incident Queue Tab */}
        <button
          onClick={() => setCurrentTab('queue')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer relative ${
            currentTab === 'queue'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ListFilter className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-mono font-bold">
              {queueCount}
            </span>
          </div>
          <span className="text-[10px]">Queue</span>
        </button>

        {/* Stats Tab */}
        <button
          onClick={() => setCurrentTab('stats')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentTab === 'stats'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px]">Impact</span>
        </button>

        {/* Mobile QR Share Tab */}
        <button
          onClick={onOpenMobileQr}
          className="flex flex-col items-center gap-1 p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px]">Share</span>
        </button>
      </div>
    </div>
  );
};
