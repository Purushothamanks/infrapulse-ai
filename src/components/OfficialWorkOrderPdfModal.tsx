'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { HazardReport } from '@/types/hazard';
import {
  Printer,
  X,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Clock,
  Phone,
  FileCheck2,
  MessageSquare
} from 'lucide-react';

interface OfficialWorkOrderPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  hazard: HazardReport | null;
}

export const OfficialWorkOrderPdfModal: React.FC<OfficialWorkOrderPdfModalProps> = ({
  isOpen,
  onClose,
  hazard
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const workOrder = hazard?.workOrder;

  useEffect(() => {
    if (!hazard || !workOrder) return;
    const verificationText = `https://3.6.172.250.nip.io/work-order?id=${workOrder.orderId}&hazard=${hazard.id}`;
    QRCode.toDataURL(verificationText, { width: 160, margin: 1 })
      .then(setQrCodeUrl)
      .catch(console.error);
  }, [hazard, workOrder]);

  if (!isOpen || !hazard || !workOrder) return null;

  const dispatchSummary = `🏛️ *GOVT OF TAMIL NADU - OFFICIAL MUNICIPAL WORK ORDER*
Order ID: ${workOrder.orderId}
Priority: ${workOrder.priorityLevel} (SLA: ${workOrder.scheduledDispatch})
Hazard: ${hazard.title} (${hazard.type.toUpperCase()})
Location: ${hazard.location.address}, ${hazard.location.ward}
GPS: ${hazard.location.lat.toFixed(5)}, ${hazard.location.lng.toFixed(5)}
Assigned Contractor: ${workOrder.contractorTeam}
Contact: ${workOrder.contactNumber}
Allocated Budget: ₹${workOrder.estimatedBudget.toLocaleString()}
Materials: ${workOrder.requiredMaterials.join(', ')}
Authorized Officer: K. S. Purushothaman (ID: TN-SAMPLE-2026)`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dispatchSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const cleanPhone = workOrder.contactNumber.replace(/[^\d]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(dispatchSummary)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors flex flex-col max-h-[94vh]">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="print:hidden flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Official Work Order Docket • {workOrder.orderId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              title="Dispatch via WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
              title="Copy Summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Government Docket Content */}
        <div ref={printableRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 print:text-black print:bg-white print:p-4 font-sans">
          {/* Government Official Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-300 pb-5 text-center space-y-1 relative">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl">🏛️</span>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white print:text-black">
                Government of Tamil Nadu
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300 print:text-gray-800">
              Department of Municipal Administration & Water Supply
            </p>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 print:text-gray-600">
              Autonomous Urban Infrastructure Triage & Sustainable Action Bureau
            </p>
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono text-xs font-bold print:bg-black print:text-white">
              OFFICIAL DISPATCH AUTHORIZATION DOCKET
            </div>
          </div>

          {/* Reference Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 print:bg-gray-100 print:border-gray-400 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Work Order Ref</span>
              <span className="font-mono font-bold text-slate-950 dark:text-white print:text-black text-sm">{workOrder.orderId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Incident Ref</span>
              <span className="font-mono font-bold text-slate-950 dark:text-white print:text-black text-sm">{hazard.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">SLA Priority</span>
              <span className="font-bold text-red-600 dark:text-red-400 print:text-red-700">{workOrder.priorityLevel}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Dispatch Status</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 print:text-green-700">{workOrder.status}</span>
            </div>
          </div>

          {/* Section: Defect & AI Inspection */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>1. Defect Classification & Computer Vision Findings</span>
            </h3>
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs bg-white dark:bg-slate-950/40 print:border-gray-400">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <span className="text-sm font-bold text-slate-950 dark:text-white print:text-black">{hazard.title}</span>
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Category: {hazard.type}
                  </span>
                </div>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  AI Confidence: {hazard.aiAnalysis.confidence}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Location & Ward</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{hazard.location.address} ({hazard.location.ward})</span>
                  <div className="font-mono text-[10px] text-slate-500">GPS: {hazard.location.lat.toFixed(5)}° N, {hazard.location.lng.toFixed(5)}° E</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Estimated Scale / Depth</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{hazard.aiAnalysis.dimensionsEstimated}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px] mb-1">Detected Defect Features:</span>
                <div className="flex flex-wrap gap-1.5">
                  {hazard.aiAnalysis.detectedFeatures.map((feat, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[10px] border border-slate-200 dark:border-slate-700 print:border-gray-300">
                      • {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Contractor Fleet & Materials BOM */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>2. Maintenance Fleet Assignment & Requisition BOM</span>
            </h3>
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs bg-white dark:bg-slate-950/40 print:border-gray-400">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Assigned Unit</span>
                  <span className="font-bold text-slate-900 dark:text-white print:text-black">{workOrder.contractorTeam}</span>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-500" />
                    <span>{workOrder.contactNumber}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Dispatch Window</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{workOrder.scheduledDispatch}</span>
                  <div className="text-[11px] text-slate-500">Max SLA: {workOrder.estimatedRepairHours} Hours</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Sanctioned Budget</span>
                  <span className="font-mono font-black text-slate-950 dark:text-white print:text-black text-sm">
                    ₹{workOrder.estimatedBudget.toLocaleString()} INR
                  </span>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Budget Code: TN-CIVIL-2026</div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px] mb-1">Pre-Allocated Bill of Materials (BOM):</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {workOrder.requiredMaterials.map((mat, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] print:bg-gray-100">
                      <span className="text-emerald-600 font-bold mr-1">✓</span>
                      <span>{mat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Environmental Impact */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30 text-xs print:bg-emerald-50 print:border-emerald-600">
            <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">🌱 Carbon & Civic Mitigation Impact:</span>
            <span className="text-emerald-800 dark:text-emerald-200">{workOrder.co2MitigationImpact}</span>
          </div>

          {/* Footer Signatures & QR Code */}
          <div className="pt-4 border-t-2 border-slate-300 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4 print:pt-6">
            <div className="flex items-center gap-3">
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="Work Order QR Code"
                  className="w-20 h-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-1"
                />
              )}
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono space-y-0.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">DIGITALLY SECURED DOCKET</div>
                <div>Scan QR to track live SLA fulfillment</div>
                <div>Server: 3.6.172.250.nip.io</div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="font-mono text-xs font-bold text-slate-900 dark:text-white print:text-black">
                K. S. Purushothaman
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Authorized Municipal Official
              </div>
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                Official Govt ID: TN-SAMPLE-2026
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                Digitally Signed & Certified • {new Date().toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
