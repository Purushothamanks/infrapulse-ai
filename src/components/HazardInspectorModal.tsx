'use client';

import React, { useState } from 'react';
import { HazardReport, WorkOrder } from '@/types/hazard';
import {
  X,
  ShieldAlert,
  MapPin,
  Clock,
  Sparkles,
  FileText,
  Truck,
  CheckCircle,
  ExternalLink,
  Printer,
  Leaf,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface HazardInspectorModalProps {
  hazard: HazardReport | null;
  onClose: () => void;
  onUpdateHazard: (updated: HazardReport) => void;
}

export const HazardInspectorModal: React.FC<HazardInspectorModalProps> = ({
  hazard,
  onClose,
  onUpdateHazard
}) => {
  const [isGeneratingWorkOrder, setIsGeneratingWorkOrder] = useState(false);

  if (!hazard) return null;

  const handleGenerateWorkOrder = async () => {
    setIsGeneratingWorkOrder(true);
    try {
      const res = await fetch('/api/generate-work-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hazardId: hazard.id,
          hazardType: hazard.type,
          severity: hazard.severity,
          ward: hazard.location.ward,
          address: hazard.location.address
        })
      });
      const data = await res.json();
      if (data.success && data.workOrder) {
        const updated: HazardReport = {
          ...hazard,
          status: 'DISPATCHED',
          workOrder: data.workOrder
        };
        onUpdateHazard(updated);
        try {
          const confettiModule = await import('canvas-confetti');
          const confettiFn = confettiModule.default || confettiModule;
          confettiFn({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (_) {}
      }
    } catch (err) {
      console.error('Work order generation error:', err);
    } finally {
      setIsGeneratingWorkOrder(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] sm:max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold border ${getUrgencyBadge(
                hazard.urgency
              )}`}
            >
              {hazard.urgency} [{hazard.severity}/100]
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-400">ID: {hazard.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          {/* Main Info Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{hazard.title}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {hazard.location.address} ({hazard.location.ward})
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {hazard.reportedAt}
              </span>
              {hazard.citizenName && (
                <span className="flex items-center gap-1 text-slate-300">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  {hazard.citizenName}
                </span>
              )}
            </div>
          </div>

          {/* Grid Layout: Visual Image with HUD on left, AI breakdown on right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Scanned Image with AI Vision HUD */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video group">
                <img
                  src={hazard.imageUrl}
                  alt={hazard.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* HUD Overlay Elements */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>AI VISION SCANNER VERIFIED</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-md border border-slate-700 text-[11px] font-mono text-white">
                  <span>CONFIDENCE: {hazard.aiAnalysis.confidence}%</span>
                </div>
              </div>

              {/* Detected Physical Dimensions */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="font-semibold text-slate-300">Estimated Physical Scale</div>
                <p className="font-mono text-cyan-300 mt-0.5">{hazard.aiAnalysis.dimensionsEstimated}</p>
              </div>
            </div>

            {/* Right: AI Intelligence Breakdown */}
            <div className="space-y-4">
              {/* Feature Tags */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Computer Vision Detected Markers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {hazard.aiAnalysis.detectedFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-200"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sustainability & Carbon Impact */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Leaf className="w-4 h-4" />
                  <span>Environmental & SDG 11 Impact</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{hazard.aiAnalysis.sustainabilityImpact}</p>
                <div className="pt-1 text-[11px] font-mono text-emerald-300">
                  Carbon Penalty: {hazard.aiAnalysis.carbonPenaltyKgPerDay} kg CO₂ equivalent / day
                </div>
              </div>

              {/* AI Recommended Remediation Action */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Suggested Municipal Protocol</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{hazard.aiAnalysis.suggestedAction}</p>
                <div className="pt-1 text-slate-400 font-mono text-[11px]">
                  Estimated Remediation Budget: ₹{hazard.aiAnalysis.estimatedCost.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Work Order Section */}
          <div className="border-t border-slate-800 pt-6">
            {hazard.workOrder ? (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-white text-sm">
                      Official Work Order Dispatched: {hazard.workOrder.orderId}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {hazard.workOrder.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Assigned Contractor Unit</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">
                      {hazard.workOrder.contractorTeam}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{hazard.workOrder.contactNumber}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Dispatch Schedule</span>
                    <span className="font-semibold text-emerald-400 mt-0.5 block">
                      {hazard.workOrder.scheduledDispatch}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Est. Time: {hazard.workOrder.estimatedRepairHours} Hours
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">Allocated Municipal Budget</span>
                    <span className="font-mono text-cyan-300 font-bold mt-0.5 block">
                      ₹{hazard.workOrder.estimatedBudget.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400">Standard Civil Rate</span>
                  </div>
                </div>

                {/* Materials Requisition List */}
                <div className="text-xs">
                  <span className="text-slate-400 font-semibold block mb-1.5">
                    Pre-Allocated Maintenance Materials:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {hazard.workOrder.requiredMaterials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 font-mono text-[11px]"
                      >
                        ✓ {mat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/20">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    Automate Civic Maintenance Dispatch
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate an official contractor work order with material inventory and schedule assignment.
                  </p>
                </div>
                <button
                  onClick={handleGenerateWorkOrder}
                  disabled={isGeneratingWorkOrder}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingWorkOrder ? (
                    <span>Allocating Fleet...</span>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Issue Work Order</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
