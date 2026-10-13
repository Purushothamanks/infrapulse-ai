'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { HazardReport } from '@/types/hazard';
import { initialHazards } from '@/data/mockHazards';
import { Navbar } from '@/components/Navbar';
import { RealWorldCityMap } from '@/components/RealWorldCityMap';
import { HazardQueue } from '@/components/HazardQueue';
import { HazardInspectorModal } from '@/components/HazardInspectorModal';
import { BottomNav } from '@/components/BottomNav';
import { MobileQrModal } from '@/components/MobileQrModal';
import { FullPageImpactView } from '@/components/FullPageImpactView';
import { AuthView } from '@/components/AuthView';
import { CitizenPortal } from '@/components/CitizenPortal';
import { supabase } from '@/lib/supabase';
import {
  Radio,
  Loader2,
  Filter
} from 'lucide-react';

function mapSupabaseRowToHazard(row: any): HazardReport {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    severity: Number(row.severity) || 50,
    urgency: row.urgency || 'HIGH',
    status: row.status || 'NOT_STARTED',
    location: row.location || {
      lat: 12.9716,
      lng: 77.5946,
      x: 500,
      y: 500,
      address: 'Reported Location',
      ward: 'Ward 1'
    },
    imageUrl: row.image_url || '/sample-hazards/1_severe_pothole_crater.png',
    reportedAt: row.reported_at || 'Just now',
    citizenName: row.citizen_name || 'Civilian Citizen',
    citizenEmail: row.citizen_email || 'citizen@gmail.com',
    upvotes: Number(row.upvotes) || 1,
    aiAnalysis: row.ai_analysis || {
      confidence: 95,
      hazardType: row.type,
      hazardLabel: row.title,
      detectedFeatures: ['Civil infrastructure defect'],
      dimensionsEstimated: 'Standard defect',
      severityScore: row.severity,
      urgencyLevel: row.urgency,
      sustainabilityImpact: 'Mitigation required.',
      suggestedAction: 'Deploy repair team.',
      carbonPenaltyKgPerDay: 25,
      estimatedCost: 25000,
      isDuplicate: false
    },
    workOrder: row.work_order || undefined
  };
}

function playChimeAlert() {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (_) {}
}

export default function Home() {
  const { user, isLoading } = useAuth();

  const [hazards, setHazards] = useState<HazardReport[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('infrapulse_hazards_store');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return initialHazards;
  });
  const [selectedHazard, setSelectedHazard] = useState<HazardReport | null>(null);
  const [inspectingHazard, setInspectingHazard] = useState<HazardReport | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isMobileQrOpen, setIsMobileQrOpen] = useState<boolean>(false);
  const [isImpactOpen, setIsImpactOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'map' | 'queue'>('map');
  const [liveIncomingAlert, setLiveIncomingAlert] = useState<HazardReport | null>(null);
  const hasInitializedRef = useRef<boolean>(false);

  const [publicUrl, setPublicUrl] = useState<string>('https://mygovthub.web.app');
  const localWifiUrl = 'http://10.121.226.91:3000';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setPublicUrl(window.location.origin);
    }
  }, []);

  // Universal Real-Time Cross-Device Incident Sync with Supabase WebSockets (<100ms) + Resilient API Polling
  useEffect(() => {
    let isMounted = true;

    // A. Query Supabase Cloud Database on Mount
    supabase
      .from('hazards')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && Array.isArray(data) && data.length > 0 && isMounted) {
          const mapped = data.map(mapSupabaseRowToHazard);
          setHazards(mapped);
          try {
            localStorage.setItem('infrapulse_hazards_store', JSON.stringify(mapped));
          } catch (_) {}
        }
      });

    // B. Real-Time WebSockets: Instant updates across all devices
    const channel = supabase
      .channel('realtime-hazards-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hazards' },
        (payload) => {
          if (!isMounted) return;
          console.log('[SUPABASE REALTIME EVENT]', payload.eventType, payload);

          if (payload.eventType === 'INSERT') {
            const incoming = mapSupabaseRowToHazard(payload.new);
            setHazards((prev) => [incoming, ...prev.filter((h) => h.id !== incoming.id)]);
            setLiveIncomingAlert(incoming);
            setSelectedHazard(incoming);
            playChimeAlert();
            setTimeout(() => {
              if (isMounted) setLiveIncomingAlert(null);
            }, 8000);
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapSupabaseRowToHazard(payload.new);
            setHazards((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setHazards((prev) => prev.filter((h) => h.id !== deletedId));
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[SUPABASE REALTIME STATUS]', status);
      });

    // C. Resilient API polling fallback (every 3 seconds) for local/AWS backend
    const syncHazards = async () => {
      try {
        const res = await fetch(`/api/hazards?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache' }
        });
        if (res.ok) {
          const text = await res.text();
          let data: any = null;
          try {
            data = JSON.parse(text);
          } catch (_) {}

          if (data && data.success && Array.isArray(data.hazards) && isMounted) {
            setHazards((prev) => {
              if (hasInitializedRef.current) {
                const prevIds = new Set(prev.map((h) => h.id));
                const newlyArrived = data.hazards.find((h: HazardReport) => !prevIds.has(h.id));

                if (newlyArrived) {
                  setLiveIncomingAlert(newlyArrived);
                  setSelectedHazard(newlyArrived);
                  playChimeAlert();
                  setTimeout(() => {
                    if (isMounted) setLiveIncomingAlert(null);
                  }, 8000);
                }
              } else {
                hasInitializedRef.current = true;
              }
              return data.hazards;
            });
          }
        }
      } catch (_) {}
    };

    // Initial fetch immediately
    syncHazards();

    const interval = setInterval(syncHazards, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter hazards
  const filteredHazards = hazards.filter((h) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CRITICAL') return h.urgency === 'CRITICAL';
    return h.type === activeFilter;
  });

  const handleAddHazard = async (newReport: HazardReport) => {
    // Optimistic local update
    const updated = [newReport, ...hazards.filter((h) => h.id !== newReport.id)];
    setHazards(updated);
    try {
      localStorage.setItem('infrapulse_hazards_store', JSON.stringify(updated));
    } catch (_) {}
    setSelectedHazard(newReport);
    setMobileTab('map');

    // 1. Broadcast directly to Supabase Realtime Cloud Database
    try {
      await supabase.from('hazards').upsert({
        id: newReport.id,
        title: newReport.title,
        type: newReport.type,
        severity: newReport.severity,
        urgency: newReport.urgency,
        status: newReport.status,
        location: newReport.location,
        image_url: newReport.imageUrl,
        reported_at: newReport.reportedAt,
        citizen_name: newReport.citizenName,
        citizen_email: newReport.citizenEmail,
        upvotes: newReport.upvotes,
        ai_analysis: newReport.aiAnalysis,
        work_order: newReport.workOrder
      });
    } catch (err) {
      console.warn('Supabase upsert notice:', err);
    }

    // 2. Also notify local/server API if available
    try {
      const res = await fetch('/api/hazards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hazard: newReport })
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && data.success && Array.isArray(data.hazards)) {
            setHazards(data.hazards);
            try {
              localStorage.setItem('infrapulse_hazards_store', JSON.stringify(data.hazards));
            } catch (_) {}
          }
        } catch (_) {}
      }
    } catch (e) {
      console.warn('Operating in offline/static mode:', e);
    }
  };

  const handleUpdateHazard = async (updated: HazardReport) => {
    const next = hazards.map((h) => (h.id === updated.id ? updated : h));
    setHazards(next);
    try {
      localStorage.setItem('infrapulse_hazards_store', JSON.stringify(next));
    } catch (_) {}
    setSelectedHazard(updated);

    // 1. Update in Supabase Realtime Cloud Database
    try {
      await supabase
        .from('hazards')
        .update({
          title: updated.title,
          type: updated.type,
          severity: updated.severity,
          urgency: updated.urgency,
          status: updated.status,
          location: updated.location,
          image_url: updated.imageUrl,
          upvotes: updated.upvotes,
          ai_analysis: updated.aiAnalysis,
          work_order: updated.workOrder
        })
        .eq('id', updated.id);
    } catch (err) {
      console.warn('Supabase update notice:', err);
    }

    // 2. Also notify local/server API if available
    try {
      const res = await fetch('/api/hazards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hazard: updated })
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && data.success && Array.isArray(data.hazards)) {
            setHazards(data.hazards);
            try {
              localStorage.setItem('infrapulse_hazards_store', JSON.stringify(data.hazards));
            } catch (_) {}
          }
        } catch (_) {}
      }
    } catch (e) {
      console.warn('Operating in offline/static mode:', e);
    }
  };

  const handleDeleteHazard = async (hazardId: string) => {
    if (hazardId === 'all') {
      setHazards([]);
      try {
        localStorage.setItem('infrapulse_hazards_store', JSON.stringify([]));
      } catch (_) {}
      setSelectedHazard(null);
      setInspectingHazard(null);

      try {
        await supabase.from('hazards').delete().neq('id', '');
      } catch (_) {}

      try {
        await fetch('/api/hazards?all=true', { method: 'DELETE' });
      } catch (e) {
        console.warn('Cleared hazards locally.');
      }
      return;
    }

    const next = hazards.filter((h) => h.id !== hazardId);
    setHazards(next);
    try {
      localStorage.setItem('infrapulse_hazards_store', JSON.stringify(next));
    } catch (_) {}
    if (selectedHazard?.id === hazardId) {
      setSelectedHazard(null);
    }
    if (inspectingHazard?.id === hazardId) {
      setInspectingHazard(null);
    }

    try {
      await supabase.from('hazards').delete().eq('id', hazardId);
    } catch (_) {}

    try {
      await fetch(`/api/hazards?id=${encodeURIComponent(hazardId)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Deleted hazard locally.');
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
        onUpdateHazard={handleUpdateHazard}
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
              onDeleteHazard={handleDeleteHazard}
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
        onDeleteHazard={handleDeleteHazard}
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
