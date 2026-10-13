'use client';

import React from 'react';
import { HazardReport, HazardProgress, getHazardProgress, progressToStatus } from '@/types/hazard';
import {
  MapPin,
  ChevronRight,
  CheckCircle2,
  ShieldAlert,
  Navigation,
  Trash2,
  Clock,
  ExternalLink
} from 'lucide-react';

interface HazardQueueProps {
  hazards: HazardReport[];
  selectedHazard: HazardReport | null;
  onSelectHazard: (hazard: HazardReport) => void;
  onNavigateLocation: (hazard: HazardReport) => void;
  onUpdateHazard?: (updated: HazardReport) => void;
  onDeleteHazard?: (hazardId: string) => void;
}

export const HazardQueue: React.FC<HazardQueueProps> = ({
  hazards,
  selectedHazard,
  onSelectHazard,
  onNavigateLocation,
  onUpdateHazard,
  onDeleteHazard
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
    <div className="w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-270px)] min-h-[460px] sm:h-[620px] transition-colors">
      {/* Queue Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
            Live Incident Queue
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hazards.length > 0 && onDeleteHazard && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Permanently clear all ${hazards.length} incidents from the municipal queue?`)) {
                  onDeleteHazard('all');
                }
              }}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline cursor-pointer px-1"
            >
              Clear All
            </button>
          )}
          <span className="text-[11px] sm:text-xs font-mono font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            {hazards.length} Items
          </span>
        </div>
      </div>

      {/* Incident List */}
      <div className="overflow-y-auto p-2.5 sm:p-3 space-y-2.5 sm:space-y-3 flex-1 scrollbar-thin">
        {hazards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-12 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <span className="font-semibold text-sm">All Clear</span>
            <span className="text-[11px] text-slate-400">No active incidents in this filter category</span>
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
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 group active:scale-[0.99] ${
                  isSelected
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 shadow-md shadow-emerald-500/10'
                    : isCritical
                    ? 'bg-red-50/70 dark:bg-red-950/20 border-red-300 dark:border-red-500/40 hover:border-red-500'
                    : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                {/* Top Row: Thumbnail + Details + Actions */}
                <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div className="relative shrink-0">
                      <img
                        src={hazard.imageUrl}
                        alt={hazard.title}
                        className="w-13 h-13 sm:w-12 sm:h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs group-hover:scale-105 transition-transform"
                      />
                      {isCritical && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </div>

                    {/* Metadata & Title */}
                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isCritical
                              ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                              : 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-400'
                          }`}
                        >
                          {hazard.urgency} [{hazard.severity}]
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {hazard.reportedAt}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {hazard.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{hazard.location.address}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Column: Map GPS Nav + Delete */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateLocation(hazard);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-500 dark:bg-emerald-950/40 dark:hover:bg-emerald-500 border border-emerald-300 dark:border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:text-slate-950 dark:hover:text-slate-950 font-bold text-[10px] sm:text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Pan map to GPS location"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Map</span>
                    </button>

                    {onDeleteHazard && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete incident ${hazard.id} (${hazard.title})?`)) {
                            onDeleteHazard(hazard.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Delete Hazard"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0 hidden sm:block" />
                  </div>
                </div>

                {/* Bottom Row: Stage Progression Toggle & Details Link */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Stage:
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
                          className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer active:scale-95 ${
                            isCurrent
                              ? opt === 'Completed'
                                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                                : opt === 'In progress'
                                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                                : 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                          title={`Set progress stage to ${opt}`}
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
