'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { initialHazards } from '@/data/mockHazards';
import { HazardReport } from '@/types/hazard';
import { Navbar } from '@/components/Navbar';
import { RealWorldCityMap } from '@/components/RealWorldCityMap';
import { HazardQueue } from '@/components/HazardQueue';
import { HazardInspectorModal } from '@/components/HazardInspectorModal';
import { BottomNav } from '@/components/BottomNav';
import { MobileQrModal } from '@/components/MobileQrModal';
import { FullPageImpactView } from '@/components/FullPageImpactView';
import { AuthView } from '@/components/AuthView';
import { CitizenPortal } from '@/components/CitizenPortal';
import {
  Radio,
  Map as MapIcon,
  ListFilter,
  Loader2,
  Filter
} from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();

  const [hazards, setHazards] = useState<HazardReport[]>(initialHazards);
  const [selectedHazard, setSelectedHazard] = useState<HazardReport | null>(null);
  const [inspectingHazard, setInspectingHazard] = useState<HazardReport | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isMobileQrOpen, setIsMobileQrOpen] = useState<boolean>(false);
  const [isImpactOpen, setIsImpactOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'map' | 'queue'>('map');

  const [publicUrl, setPublicUrl] = useState<string>('https://exemption-blond-acute-blast.trycloudflare.com');
  const localWifiUrl = 'http://10.121.226.91:3000';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setPublicUrl(window.location.origin);
    }
  }, []);

  // Load hazards from localStorage on mount so changes between admin & citizen sync seamlessly
  useEffect(() => {
    try {
      const saved = localStorage.getItem('infrapulse_hazards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHazards(parsed);
        }
      }
    } catch {}
  }, []);

  const saveHazards = (newHazards: HazardReport[]) => {
    setHazards(newHazards);
    try {
      localStorage.setItem('infrapulse_hazards', JSON.stringify(newHazards));
    } catch {}
  };

  // Filter hazards
  const filteredHazards = hazards.filter((h) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CRITICAL') return h.urgency === 'CRITICAL';
    return h.type === activeFilter;
  });

  const handleAddHazard = (newReport: HazardReport) => {
    const updated = [newReport, ...hazards];
    saveHazards(updated);
    setSelectedHazard(newReport);
    setMobileTab('map');
  };

  const handleUpdateHazard = (updated: HazardReport) => {
    const next = hazards.map((h) => (h.id === updated.id ? updated : h));
    saveHazards(next);
    setSelectedHazard(updated);
  };

  const handleDeleteHazard = (hazardId: string) => {
    const next = hazards.filter((h) => h.id !== hazardId);
    saveHazards(next);
    if (selectedHazard?.id === hazardId) {
      setSelectedHazard(null);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3 transition-colors">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-xs font-mono">Initializing InfraPulse Secure Portal...</span>
      </div>
    );
  }

  // 2. Unauthenticated State -> Render Auth Portal
  if (!user) {
    return <AuthView />;
  }

  // 3. Civilian Citizen State -> Render Citizen Grievance Portal
  if (user.role === 'citizen') {
    return (
      <CitizenPortal
        hazards={hazards}
        onAddHazard={handleAddHazard}
        onDeleteHazard={handleDeleteHazard}
      />
    );
  }

  // 4. Municipal Admin State -> Render Streamlined Admin Command Center
  const criticalCount = hazards.filter((h) => h.urgency === 'CRITICAL').length;
  const filters = [
    { id: 'ALL', label: 'All Incidents', count: hazards.length },
    { id: 'CRITICAL', label: 'Critical Risk', count: criticalCount },
    { id: 'pothole', label: 'Roads & Pavements', count: hazards.filter((h) => h.type === 'pothole').length },
    { id: 'water_leak', label: 'Water Mains', count: hazards.filter((h) => h.type === 'water_leak').length },
    { id: 'structural_crack', label: 'Structural', count: hazards.filter((h) => h.type === 'structural_crack').length },
    { id: 'illegal_waste', label: 'Waste Dumping', count: hazards.filter((h) => h.type === 'illegal_waste').length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20 lg:pb-6 transition-colors">
      {/* Navigation Header with Admin Profile & Logout */}
      <Navbar
        onOpenMobileQr={() => setIsMobileQrOpen(true)}
        onOpenImpact={() => setIsImpactOpen(true)}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        totalActiveHazards={hazards.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
        {/* Mobile View Tab Switcher (Visible only on mobile/tablet) */}
        <div className="flex lg:hidden items-center justify-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mobileTab === 'map'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>GIS Map</span>
          </button>
          <button
            onClick={() => setMobileTab('queue')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mobileTab === 'queue'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Incidents Queue ({filteredHazards.length})</span>
          </button>
        </div>

        {/* Clean Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] hidden sm:inline">FILTER:</span>
          </div>
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <span>{filter.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dual Pane Layout (Map 8 Cols, Queue 4 Cols on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Map View */}
          <div
            className={`space-y-2 lg:col-span-8 ${
              mobileTab === 'map' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 px-1">
              <span className="flex items-center gap-1.5 font-mono">
                <Radio className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                TACTICAL MUNICIPAL GIS SENSOR GRID
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                PULSING PINS: CRITICAL HAZARD
              </span>
            </div>
            <RealWorldCityMap
              hazards={filteredHazards}
              selectedHazard={selectedHazard}
              onSelectHazard={(h) => setSelectedHazard(h)}
            />
          </div>

          {/* Incident Queue */}
          <div
            className={`lg:col-span-4 ${
              mobileTab === 'queue' ? 'block' : 'hidden lg:block'
            }`}
          >
            <HazardQueue
              hazards={filteredHazards}
              selectedHazard={selectedHazard}
              onSelectHazard={(h) => setInspectingHazard(h)}
              onNavigateLocation={(hazard) => {
                setSelectedHazard(hazard);
                setInspectingHazard(null); // Never open the whole issue modal on GPS navigate click!
                setMobileTab('map');
              }}
              onUpdateHazard={handleUpdateHazard}
            />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet) */}
      <BottomNav
        currentTab={mobileTab}
        setCurrentTab={(tab) => {
          if (tab === 'stats') {
            setIsImpactOpen(true);
          } else {
            setMobileTab(tab);
          }
        }}
        onOpenMobileQr={() => setIsMobileQrOpen(true)}
        queueCount={filteredHazards.length}
      />

      {/* Popups, Drawers & Modals */}
      <HazardInspectorModal
        hazard={inspectingHazard}
        onClose={() => setInspectingHazard(null)}
        onUpdateHazard={(updated) => {
          handleUpdateHazard(updated);
          setInspectingHazard(updated);
        }}
      />

      <MobileQrModal
        isOpen={isMobileQrOpen}
        onClose={() => setIsMobileQrOpen(false)}
        publicUrl={publicUrl}
        localWifiUrl={localWifiUrl}
      />

      {/* Full-Page Municipal Sustainability & Environmental Impact View */}
      <FullPageImpactView
        isOpen={isImpactOpen}
        onClose={() => setIsImpactOpen(false)}
        hazards={hazards}
      />
    </div>
  );
}
