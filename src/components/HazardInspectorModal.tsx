'use client';

import React, { useState } from 'react';
import { HazardReport, HazardProgress, getHazardProgress, progressToStatus } from '@/types/hazard';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  FileText,
  Truck,
  CheckCircle,
  Leaf,
  AlertTriangle,
  UserCheck,
  Printer,
  MessageSquare,
  Mail,
  Send
} from 'lucide-react';
import { OfficialWorkOrderPdfModal } from './OfficialWorkOrderPdfModal';

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
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [statusEmailNotice, setStatusEmailNotice] = useState<string | null>(null);

  if (!hazard) return null;

  const currentProgress = getHazardProgress(hazard.status);
  const PROGRESS_OPTIONS: HazardProgress[] = ['Not started', 'In progress', 'Completed'];

  const dispatchStatusEmail = async (prog: HazardProgress, workOrderId?: string, contractorTeam?: string) => {
    const targetEmail = hazard.citizenEmail || 'purushothamank.s799@gmail.com';
    try {
      const res = await fetch('/api/notifications/status-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hazardId: hazard.id,
          hazardTitle: hazard.title,
          newStatus: prog,
          citizenEmail: targetEmail,
          citizenName: hazard.citizenName || 'Civic Scout',
          locationAddress: hazard.location.address,
          ward: hazard.location.ward,
          contractorTeam: contractorTeam || hazard.workOrder?.contractorTeam,
          scheduledDispatch: hazard.workOrder?.scheduledDispatch,
          workOrderId: workOrderId || hazard.workOrder?.orderId
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusEmailNotice(`Automated email notification sent to ${targetEmail} (${prog})`);
        setTimeout(() => setStatusEmailNotice(null), 8000);
      }
    } catch (err) {
      console.error('Failed to dispatch grievance status email:', err);
    }
  };

  const handleProgressChange = (newProg: HazardProgress) => {
    const newStatus = progressToStatus(newProg);
    onUpdateHazard({
      ...hazard,
      status: newStatus
    });

    // Immediately dispatch email update to the citizen who posted the hazard
    if (newProg === 'In progress' || newProg === 'Completed') {
      dispatchStatusEmail(newProg);
    }
  };

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
          status: 'IN_PROGRESS',
          workOrder: data.workOrder
        };
        onUpdateHazard(updated);
        // Dispatch email notification informing citizen that repair work order was generated & dispatched
        dispatchStatusEmail('In progress', data.workOrder.orderId, data.workOrder.contractorTeam);
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
        return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-500/40';
      default:
        return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] sm:max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden transition-colors">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold border ${getUrgencyBadge(
                hazard.urgency
              )}`}
            >
              {hazard.urgency} [{hazard.severity}/100]
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-500 dark:text-slate-400">
              ID: {hazard.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          {/* Main Info Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{hazard.title}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 text-slate-800 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {hazard.location.address} ({hazard.location.ward})
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  {hazard.reportedAt}
                </span>
                {hazard.citizenName && (
                  <span className="flex items-center gap-1 text-slate-800 dark:text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    {hazard.citizenName.replace(/commissioner\s*/gi, '').trim()}
                  </span>
                )}
                {hazard.citizenEmail && (
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-emerald-500" />
                    {hazard.citizenEmail}
                  </span>
                )}
              </div>
            </div>

            {/* Live Email Notification Toast */}
            {statusEmailNotice && (
              <div className="w-full p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 shadow-sm">
                <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-bounce" />
                <span className="font-semibold">{statusEmailNotice}</span>
              </div>
            )}

            {/* ADMIN PROGRESS CONTROLLER */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
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
                      onClick={() => handleProgressChange(opt)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? opt === 'Completed'
                            ? 'bg-emerald-500 text-slate-950 shadow-xs'
                            : opt === 'In progress'
                            ? 'bg-cyan-500 text-slate-950 shadow-xs'
                            : 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid Layout: Visual Image with HUD on left, AI breakdown on right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Scanned Image with AI Vision HUD */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 aspect-video group shadow-sm">
                <img
                  src={hazard.imageUrl}
                  alt={hazard.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                {/* AI Bounding Box HUD */}
                <div className="absolute top-4 left-4 right-4 bottom-12 border-2 border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                      CV CLASSIFIER: {hazard.type.toUpperCase()}
                    </span>
                    <span className="bg-slate-950/90 text-emerald-400 font-mono text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/40">
                      CONF: {hazard.aiAnalysis.confidence}%
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Autonomous CV Triage
                  </span>
                  <span>GEOTAG VERIFIED</span>
                </div>
              </div>

              {/* Detected Physical Dimensions */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-300">Estimated Physical Scale</div>
                <p className="font-mono text-cyan-600 dark:text-cyan-300 mt-0.5">{hazard.aiAnalysis.dimensionsEstimated}</p>
              </div>
            </div>

            {/* Right: AI Intelligence Breakdown */}
            <div className="space-y-4">
              {/* Feature Tags */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Computer Vision Detected Markers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {hazard.aiAnalysis.detectedFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sustainability & Carbon Impact */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400">
                  <Leaf className="w-4 h-4" />
                  <span>Environmental & SDG 11 Impact</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{hazard.aiAnalysis.sustainabilityImpact}</p>
                <div className="pt-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                  Carbon Penalty: {hazard.aiAnalysis.carbonPenaltyKgPerDay} kg CO₂ equivalent / day
                </div>
              </div>

              {/* AI Recommended Remediation Action */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Suggested Municipal Protocol</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{hazard.aiAnalysis.suggestedAction}</p>
                <div className="pt-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                  Estimated Remediation Budget: ₹{hazard.aiAnalysis.estimatedCost.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Work Order Section */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            {hazard.workOrder ? (
              <div className="p-5 rounded-2xl bg-cyan-50/50 dark:bg-slate-950/80 border border-cyan-200 dark:border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      Official Work Order Dispatched: {hazard.workOrder.orderId}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40">
                    {hazard.workOrder.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Assigned Contractor Unit</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {hazard.workOrder.contractorTeam}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{hazard.workOrder.contactNumber}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Dispatch Schedule</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {hazard.workOrder.scheduledDispatch}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Est. Time: {hazard.workOrder.estimatedRepairHours} Hours
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Allocated Municipal Budget</span>
                    <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold mt-0.5 block">
                      ₹{hazard.workOrder.estimatedBudget.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Standard Civil Rate</span>
                  </div>
                </div>

                {/* Materials Requisition List */}
                <div className="text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-1.5">
                    Pre-Allocated Maintenance Materials:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {hazard.workOrder.requiredMaterials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-mono text-[11px]"
                      >
                        ✓ {mat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Official Work Order Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-cyan-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPdfModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>View / Print Official Docket (PDF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cleanPhone = hazard.workOrder!.contactNumber.replace(/[^\d]/g, '');
                      const text = `🏛️ OFFICIAL MUNICIPAL WORK ORDER: ${hazard.workOrder!.orderId} for ${hazard.title} at ${hazard.location.address}. Allocated budget: ₹${hazard.workOrder!.estimatedBudget}. Please dispatch crew immediately.`;
                      window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">WhatsApp Dispatch</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 dark:from-slate-950 via-teal-50 dark:via-slate-900 to-emerald-50 dark:to-slate-950 border border-emerald-300 dark:border-emerald-500/20">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Automate Civic Maintenance Dispatch
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
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

      {/* Official Printable Work Order PDF Modal */}
      <OfficialWorkOrderPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        hazard={hazard}
      />
    </div>
  );
};
