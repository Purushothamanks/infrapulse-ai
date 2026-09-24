'use client';

import React from 'react';
import { AlertTriangle, Leaf, Zap, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { HazardReport } from '@/types/hazard';

interface SustainabilityMetricsProps {
  hazards: HazardReport[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const SustainabilityMetrics: React.FC<SustainabilityMetricsProps> = ({
  hazards,
  activeFilter,
  setActiveFilter
}) => {
  const criticalCount = hazards.filter((h) => h.urgency === 'CRITICAL').length;
  const inRepairCount = hazards.filter((h) => h.status === 'IN_REPAIR' || h.status === 'DISPATCHED').length;
  const totalCarbonPenalty = hazards.reduce((acc, h) => acc + h.aiAnalysis.carbonPenaltyKgPerDay, 0);

  const filters = [
    { id: 'ALL', label: 'All Incidents', count: hazards.length },
    { id: 'CRITICAL', label: 'Critical Risk', count: criticalCount, badgeColor: 'bg-red-500/20 text-red-400' },
    { id: 'pothole', label: 'Roads & Pavements', count: hazards.filter(h => h.type === 'pothole').length },
    { id: 'water_leak', label: 'Water Mains', count: hazards.filter(h => h.type === 'water_leak').length },
    { id: 'structural_crack', label: 'Structural', count: hazards.filter(h => h.type === 'structural_crack').length },
    { id: 'illegal_waste', label: 'Waste Dumping', count: hazards.filter(h => h.type === 'illegal_waste').length },
  ];

  return (
    <div className="w-full space-y-4">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Critical Emergency Alerts */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-950/40 via-slate-900/60 to-slate-950 border border-red-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-10 group-hover:opacity-25 transition-opacity">
            <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 text-red-400" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-red-400 uppercase tracking-wider truncate">
            <AlertTriangle className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-red-400 animate-pulse shrink-0" />
            <span className="truncate">Critical Queue</span>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-mono">{criticalCount}</span>
            <span className="text-[10px] sm:text-xs text-red-300 font-medium truncate">Instant Dispatch</span>
          </div>
          <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">Severe road craters & shock</p>
        </div>

        {/* Card 2: Sustainability & Carbon Offset */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950 border border-emerald-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-10 group-hover:opacity-25 transition-opacity">
            <Leaf className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-emerald-400 uppercase tracking-wider truncate">
            <Leaf className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Emission Risk</span>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-mono">{totalCarbonPenalty.toFixed(0)}</span>
            <span className="text-[10px] sm:text-xs text-emerald-300 font-medium">kg CO₂e/day</span>
          </div>
          <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">SDG 11: Sustainable Cities</p>
        </div>

        {/* Card 3: AI Speed Multiplier */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950 border border-cyan-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-10 group-hover:opacity-25 transition-opacity">
            <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-400" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-cyan-400 uppercase tracking-wider truncate">
            <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">AI Triage Speed</span>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-mono">1.2s</span>
            <span className="text-[10px] sm:text-xs text-cyan-300 font-medium">vs 48h manual</span>
          </div>
          <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">CV Severity Scoring</p>
        </div>

        {/* Card 4: Municipal Crews in Motion */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-slate-950 border border-amber-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-10 group-hover:opacity-25 transition-opacity">
            <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-amber-400 uppercase tracking-wider truncate">
            <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Active Crews</span>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-mono">{inRepairCount}</span>
            <span className="text-[10px] sm:text-xs text-amber-300 font-medium">On-Field Fixes</span>
          </div>
          <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">Automated SLA Dispatch</p>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <span>{filter.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
