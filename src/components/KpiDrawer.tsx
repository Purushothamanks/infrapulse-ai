'use client';

import React from 'react';
import { X, ShieldAlert, AlertTriangle, Leaf, Zap, Clock, BarChart3 } from 'lucide-react';
import { HazardReport } from '@/types/hazard';

interface KpiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hazards: HazardReport[];
}

export const KpiDrawer: React.FC<KpiDrawerProps> = ({ isOpen, onClose, hazards }) => {
  if (!isOpen) return null;

  const criticalCount = hazards.filter((h) => h.urgency === 'CRITICAL').length;
  const inRepairCount = hazards.filter((h) => h.status === 'IN_REPAIR' || h.status === 'DISPATCHED').length;
  const totalCarbonPenalty = hazards.reduce((acc, h) => acc + h.aiAnalysis.carbonPenaltyKgPerDay, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Municipal Telemetry & KPIs</h3>
                <p className="text-xs text-slate-400">Urban Analytics & Environmental Impact</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* The 4 KPI Cards */}
          <div className="space-y-3.5">
            {/* 1. Critical Queue */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/40 via-slate-900/60 to-slate-950 border border-red-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  Critical Queue
                </span>
                <span className="text-2xl font-black text-white font-mono">{criticalCount}</span>
              </div>
              <p className="text-xs text-red-300 font-medium mt-1">Instant Dispatch Required</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Severe road craters & electrical shock hazards</p>
            </div>

            {/* 2. Emission Risk */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950 border border-emerald-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  Emission Risk
                </span>
                <span className="text-2xl font-black text-white font-mono">{totalCarbonPenalty.toFixed(0)}</span>
              </div>
              <p className="text-xs text-emerald-300 font-medium mt-1">kg CO₂e / day penalty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">SDG 11: Sustainable Cities & Communities</p>
            </div>

            {/* 3. AI Triage Speed */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950 border border-cyan-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  AI Triage Speed
                </span>
                <span className="text-2xl font-black text-white font-mono">1.2s</span>
              </div>
              <p className="text-xs text-cyan-300 font-medium mt-1">vs 48h manual inspection</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated Computer Vision Severity Scoring</p>
            </div>

            {/* 4. Active Crews */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-slate-950 border border-amber-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Active Crews
                </span>
                <span className="text-2xl font-black text-white font-mono">{inRepairCount}</span>
              </div>
              <p className="text-xs text-amber-300 font-medium mt-1">On-Field Deployments</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated Contractor SLA Dispatch</p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors mt-6 cursor-pointer"
        >
          Close Telemetry Drawer
        </button>
      </div>
    </div>
  );
};
