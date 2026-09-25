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
  const [liveIncomingAlert, setLiveIncomingAlert] = useState<HazardReport | null>(null);

  const [publicUrl, setPublicUrl] = useState<string>('https://3.6.172.250.nip.io');
  const localWifiUrl = 'http://10.121.226.91:3000';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setPublicUrl(window.location.origin);
    }
  }, []);

  // Real-Time Cross-Device Incident Sync with /api/hazards
  useEffect(() => {
    let isMounted = true;

    const syncHazards = async () => {
      try {
        const res = await fetch('/api/hazards');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.hazards) && isMounted) {
            setHazards((prev) => {
              // Check if a new hazard arrived from another device
              if (prev.length > 0 && data.hazards.length > prev.length) {
                const newest = data.hazards[0];
                if (newest && !prev.some((h) => h.id === newest.id)) {
                  setLiveIncomingAlert(newest);
                  setSelectedHazard(newest);
                  setTimeout(() => {
                    if (isMounted) setLiveIncomingAlert(null);
                  }, 8000);
                }
              }
              return data.hazards;
            });
          }
        }
      } catch (_) {}
    };

    // Initial fetch
    syncHazards();

    // 3-second live sync interval across all phones & laptops
    const interval = setInterval(syncHazards, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Filter hazards
  const filteredHazards = hazards.filter((h) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CRITICAL') return h.urgency === 'CRITICAL';
    return h.type === activeFilter;
  });

  const handleAddHazard = async (newReport: HazardReport) => {
    const updated = [newReport, ...hazards];
    setHazards(updated);
    setSelectedHazard(newReport);
    setMobileTab('map');

    try {
      await fetch('/api/hazards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hazard: newReport })
      });
    } catch (e) {
      console.error('Failed to sync new hazard to server:', e);
    }
  };

  const handleUpdateHazard = async (updated: HazardReport) => {
    const next = hazards.map((h) => (h.id === updated.id ? updated : h));
    setHazards(next);
    setSelectedHazard(updated);

    try {
      await fetch('/api/hazards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hazard: updated })
      });
    } catch (e) {
      console.error('Failed to sync hazard update to server:', e);
    }
  };

  const handleDeleteHazard = async (hazardId: string) => {
    const next = hazards.filter((h) => h.id !== hazardId);
    setHazards(next);
    if (selectedHazard?.id === hazardId) {
      setSelectedHazard(null);
    }

    try {
      await fetch(`/api/hazards?id=${hazardId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('Failed to delete hazard on server:', e);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3 transition-colors">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-xs font-mono">Initializing MyGovt AI Hub Secure Portal...</span>
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
        {/* Real-Time Cross-Device Incident Notification Banner */}
        {liveIncomingAlert && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl shadow-red-500/25 flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300 border border-white/20">
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2 rounded-xl bg-white/20 text-lg animate-bounce">🚨</span>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-rose-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Incident Synced from Mobile Device
                </div>
                <div className="text-xs sm:text-sm font-bold truncate">
                  {liveIncomingAlert.title} • {liveIncomingAlert.location.ward}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedHazard(liveIncomingAlert);
                setInspectingHazard(liveIncomingAlert);
                setLiveIncomingAlert(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-md cursor-pointer whitespace-nowrap shrink-0"
            >
              Inspect Work Order
            </button>
          </div>
        )}

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
