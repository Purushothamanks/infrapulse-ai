'use client';

import React from 'react';
import { HazardReport, HazardProgress, getHazardProgress, progressToStatus } from '@/types/hazard';
import { Clock, MapPin, ChevronRight, CheckCircle2, ShieldAlert, Navigation } from 'lucide-react';

interface HazardQueueProps {
  hazards: HazardReport[];
  selectedHazard: HazardReport | null;
  onSelectHazard: (hazard: HazardReport) => void;
  onNavigateLocation: (hazard: HazardReport) => void;
  onUpdateHazard?: (updated: HazardReport) => void;
}

export const HazardQueue: React.FC<HazardQueueProps> = ({
  hazards,
  selectedHazard,
  onSelectHazard,
  onNavigateLocation,
  onUpdateHazard
}) => {
  const PROGRESS_OPTIONS: HazardProgress[] = ['Not started', 'In progress', 'Completed'];

  const handleStatusChange = (hazard: HazardReport, newProgress: HazardProgress) => {
    if (!onUpdateHazard) return;
    const newStatus = progressToStatus(newProgress);
    onUpdateHazard({
      ...hazard,
      status: newStatus
    });
  };

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[520px] sm:h-[620px] transition-colors">
      {/* Queue Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Live Triage Queue</h3>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          {hazards.length} Incidents
        </span>
      </div>

      {/* Incident List */}
      <div className="overflow-y-auto p-2.5 sm:p-3 space-y-2.5 flex-1 scrollbar-thin">
        {hazards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
            <span>No active hazards in this filter category</span>
          </div>
        ) : (
          hazards.map((hazard) => {
            const isSelected = selectedHazard?.id === hazard.id;
            const isCritical = hazard.urgency === 'CRITICAL';
            const currentProgress = getHazardProgress(hazard.status);

            return (
              <div
                key={hazard.id}
                onClick={() => onSelectHazard(hazard)}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 group ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10'
                    : isCritical
                    ? 'bg-red-50/60 dark:bg-red-950/15 border-red-300 dark:border-red-500/30 hover:border-red-500'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                {/* Top Row: Thumbnail + Info + GPS Button */}
                <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <img
                      src={hazard.imageUrl}
                      alt={hazard.title}
                      className="w-12 h-12 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                    />

                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            isCritical
                              ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                          }`}
                        >
                          {hazard.urgency} [{hazard.severity}]
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {hazard.reportedAt}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {hazard.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                        {hazard.location.address}
                      </p>
                    </div>
                  </div>

                  {/* GPS MAP NAVIGATE SYMBOL BUTTON */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateLocation(hazard);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:text-slate-950 transition-all cursor-pointer shadow-xs group/nav"
                      title="Navigate Map to Hazard GPS Location"
                    >
                      <Navigation className="w-3.5 h-3.5 group-hover/nav:scale-110" />
                      <span className="text-[10px] font-mono font-bold hidden sm:inline">GPS</span>
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                  </div>
                </div>

                {/* Bottom Row: ADMIN PROGRESS SELECTOR (Not started, In progress, Completed) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Progress:
                  </span>
                  <div className="flex items-center gap-1">
                    {PROGRESS_OPTIONS.map((opt) => {
                      const isCurrent = currentProgress === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(hazard, opt);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? opt === 'Completed'
                                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                                : opt === 'In progress'
                                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                                : 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                          title={`Set progress to ${opt}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
