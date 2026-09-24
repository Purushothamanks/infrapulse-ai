'use client';

import React from 'react';
import { HazardReport } from '@/types/hazard';
import { AlertTriangle, Clock, MapPin, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface HazardQueueProps {
  hazards: HazardReport[];
  selectedHazard: HazardReport | null;
  onSelectHazard: (hazard: HazardReport) => void;
}

export const HazardQueue: React.FC<HazardQueueProps> = ({
  hazards,
  selectedHazard,
  onSelectHazard
}) => {
  return (
    <div className="w-full rounded-3xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[580px]">
      {/* Queue Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Live Triage Queue</h3>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {hazards.length} Incidents
        </span>
      </div>

      {/* Incident List */}
      <div className="overflow-y-auto p-3 space-y-2.5 flex-1 scrollbar-thin scrollbar-thumb-slate-800">
        {hazards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
            <span>No active hazards in this filter category</span>
          </div>
        ) : (
          hazards.map((hazard) => {
            const isSelected = selectedHazard?.id === hazard.id;
            const isCritical = hazard.urgency === 'CRITICAL';

            return (
              <div
                key={hazard.id}
                onClick={() => onSelectHazard(hazard)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10'
                    : isCritical
                    ? 'bg-red-950/15 border-red-500/30 hover:border-red-500/60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Thumbnail */}
                  <img
                    src={hazard.imageUrl}
                    alt={hazard.title}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                  />

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          isCritical
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {hazard.urgency} [{hazard.severity}]
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {hazard.reportedAt}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {hazard.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      {hazard.location.address}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-all" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
