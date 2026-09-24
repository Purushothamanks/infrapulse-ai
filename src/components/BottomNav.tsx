'use client';

import React from 'react';
import { Map, ListFilter, Plus, BarChart2, Smartphone } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'map' | 'queue' | 'stats';
  setCurrentTab: (tab: 'map' | 'queue' | 'stats') => void;
  onOpenReport: () => void;
  onOpenMobileQr: () => void;
  queueCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenReport,
  onOpenMobileQr,
  queueCount
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-4 py-2 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Map Tab */}
        <button
          onClick={() => setCurrentTab('map')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentTab === 'map' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px]">Map</span>
        </button>

        {/* Incident Queue Tab */}
        <button
          onClick={() => setCurrentTab('queue')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer relative ${
            currentTab === 'queue' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ListFilter className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-mono font-bold">
              {queueCount}
            </span>
          </div>
          <span className="text-[10px]">Feed</span>
        </button>

        {/* Center Floating Action Button (FAB) for Camera / Report */}
        <div className="relative -top-5">
          <button
            onClick={onOpenReport}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/40 border-4 border-slate-950 active:scale-95 transition-transform cursor-pointer"
            aria-label="Report Civic Hazard"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Stats Tab */}
        <button
          onClick={() => setCurrentTab('stats')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            currentTab === 'stats' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px]">Impact</span>
        </button>

        {/* Mobile QR Share Tab */}
        <button
          onClick={onOpenMobileQr}
          className="flex flex-col items-center gap-1 p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px]">Share</span>
        </button>
      </div>
    </div>
  );
};
