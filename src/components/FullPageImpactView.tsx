'use client';

import React from 'react';
import { HazardReport } from '@/types/hazard';
import { cityWardStats } from '@/data/mockHazards';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  X,
  ArrowLeft,
  Leaf,
  Droplet,
  Fuel,
  Award,
  Globe2,
  BarChart3
} from 'lucide-react';

interface FullPageImpactViewProps {
  isOpen: boolean;
  onClose: () => void;
  hazards: HazardReport[];
}

export const FullPageImpactView: React.FC<FullPageImpactViewProps> = ({
  isOpen,
  onClose,
  hazards
}) => {
  if (!isOpen) return null;

  const totalCarbonPenalty = hazards.reduce((acc, h) => acc + h.aiAnalysis.carbonPenaltyKgPerDay, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto animate-in fade-in duration-200 transition-colors">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-emerald-900/40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Back to Command Center</span>
          </button>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Municipal Sustainability & Environmental Impact</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                FULL REPORT
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 dark:from-emerald-950/50 dark:via-slate-900 dark:to-slate-950 border border-emerald-300 dark:border-emerald-500/30 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
              <Globe2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>UNITED NATIONS SDG 11: SUSTAINABLE CITIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Real-Time Ecological Mitigation & Civic Resource Conservation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              MyGovt AI Hub continuously measures how autonomous vision triage prevents carbon emissions from traffic congestion, saves treated drinking water, and halts groundwater pollution.
            </p>
          </div>
        </div>

        {/* 4 Core Primary Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Carbon Offset */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-500/30 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-4 h-4" />
                Carbon Penalty
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">DAILY IMPACT</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalCarbonPenalty.toFixed(1)}</span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">kg CO₂e/day</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Mitigated by dispatching repair crews to road craters & live shock circuits.
            </p>
          </div>

          {/* 2. Potable Water Protected */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-cyan-200 dark:border-cyan-500/30 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                Freshwater Saved
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">FLOW AUDIT</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">27,000</span>
              <span className="text-xs text-cyan-700 dark:text-cyan-300 font-semibold">Liters / Hr</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Preserved through rapid SCADA valve isolation and hydro-collar deployment.
            </p>
          </div>

          {/* 3. Traffic Efficiency */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-amber-200 dark:border-amber-500/30 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Fuel className="w-4 h-4" />
                Traffic Idle Cut
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">MOBILITY</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">-22%</span>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold">Fuel Wastage</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Eliminated stop-and-go congestion at Outer Ring Road and Tech Corridor junctions.
            </p>
          </div>

          {/* 4. Budget Remediation Saved */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-purple-200 dark:border-purple-500/30 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Remediation Saved
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">CIVIC ROI</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">10x</span>
              <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold">Cost Multiplier</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Fixing fissures early stops structural bridge overhaul costs down the line.
            </p>
          </div>
        </div>

        {/* Detailed UN SDG 11 Goals Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>United Nations Sustainability Targets Matrix</span>
            </h3>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">METROPOLITAN ALIGNMENT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">SDG Target 11.2: Safe & Resilient Transport</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Automated detection of pavement shear fissures and deep craters protects two-wheeler commuters from fatal accidents and ensures urban expressways maintain optimal vehicular throughput.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Avg. Repair Turnaround: 3.5 hrs</span>
                <span className="text-emerald-600 dark:text-emerald-400">Accident Risk: -74%</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-cyan-700 dark:text-cyan-400">SDG Target 11.6: Municipal Solid Waste & Air Quality</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300">
                  COMPLIANT
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Computer vision models instantly tag illegal chemical and mixed plastics dumping in wetland buffer zones, preventing toxic leachate from polluting municipal freshwater aquifers.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Aquifer Vulnerability: Prevented</span>
                <span className="text-cyan-600 dark:text-cyan-400">Methane Release: Nullified</span>
              </div>
            </div>
          </div>
        </section>

        {/* Ward Sustainability Leaderboard */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>City Ward Infrastructure & Green Health Index</span>
            </h3>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">6 WARDS MONITORED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cityWardStats.map((ward) => (
              <div
                key={ward.wardId}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{ward.wardId}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{ward.name}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Green Health Score</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{ward.greenScore} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${ward.greenScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
                  <span>Open: {ward.openHazards}</span>
                  <span>Resolved: {ward.resolvedHazards}</span>
                  <span>Avg: {ward.averageFixHours}h</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
