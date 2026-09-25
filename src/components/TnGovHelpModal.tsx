'use client';

import React from 'react';
import {
  X,
  PhoneCall,
  Mail,
  Globe,
  ExternalLink,
  ShieldAlert,
  Building2,
  Droplet,
  Zap,
  LifeBuoy,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

interface TnGovHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TnGovHelpModal: React.FC<TnGovHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 dark:bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 font-black shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Government of Tamil Nadu
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Municipal Grievance Redressal & Citizen Help Desk (தமிழ்நாடு அரசு)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* Quick Action Emergency Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:1100"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-950/20 text-slate-950">
                  <PhoneCall className="w-4 h-4 group-hover:animate-bounce" />
                </div>
                <div>
                  <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-900/80">CM Helpline (24x7)</span>
                  <span className="text-base font-black">Call 1100</span>
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-slate-950 text-emerald-300 text-[10px] font-mono">Toll-Free</span>
            </a>

            <a
              href="tel:1913"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-950/20 text-slate-950">
                  <Building2 className="w-4 h-4 group-hover:animate-bounce" />
                </div>
                <div>
                  <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-900/80">Municipal Control Room</span>
                  <span className="text-base font-black">Call 1913</span>
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-slate-950 text-cyan-300 text-[10px] font-mono">GCC / MAWS</span>
            </a>
          </div>

          {/* Department Directory List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Official Portals & Communication Channels
            </h4>

            {/* 1. CM Helpline (Makkaludan Mudhalvar) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-500" />
                  CM Helpline - Makkaludan Mudhalvar
                </span>
                <a
                  href="https://cmhelpline.tnega.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  <span>cmhelpline.tnega.org</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Official single-window citizen grievance redressal platform under Chief Minister Special Cell.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                <a href="tel:1100" className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-emerald-500">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                  <span>1100 (24x7 Toll Free)</span>
                </a>
                <a href="mailto:cmhelpline@tn.gov.in" className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-emerald-500">
                  <Mail className="w-3.5 h-3.5 text-cyan-500" />
                  <span>cmhelpline@tn.gov.in</span>
                </a>
              </div>
            </div>

            {/* 2. Municipal Administration & Water Supply (MAWS) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-500" />
                  Municipal Administration & Water Supply (MAWS)
                </span>
                <a
                  href="https://tnurbantree.tn.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                >
                  <span>tnurbantree.tn.gov.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                State administration for roads, stormwater drains, waste management, and civic repairs.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                <a href="tel:1913" className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-cyan-500">
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-500" />
                  <span>1913 / 044-25619206</span>
                </a>
                <a href="mailto:contact@chennaicorporation.gov.in" className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-cyan-500">
                  <Mail className="w-3.5 h-3.5 text-cyan-500" />
                  <span>contact@chennaicorporation.gov.in</span>
                </a>
              </div>
            </div>

            {/* 3. Tamil Nadu Water Supply & Drainage (TWAD) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  Water Supply & Metro Water (TWAD / CMWSSB)
                </span>
                <a
                  href="https://www.twadboard.tn.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  <span>twadboard.tn.gov.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                For major pipeline burst reporting, clean drinking water supply, and sewer overflows.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                <a href="tel:1916" className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-blue-500">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-500" />
                  <span>1916 (Metro Water 24x7)</span>
                </a>
                <a href="mailto:twadboard@tn.gov.in" className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-blue-500">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>twadboard@tn.gov.in</span>
                </a>
              </div>
            </div>

            {/* 4. Tamil Nadu State Main Portal & Disaster Management */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-500" />
                  State Portal & Disaster Management (TNSDMA)
                </span>
                <a
                  href="https://www.tn.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                >
                  <span>www.tn.gov.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Official State Government of Tamil Nadu Web Portal & State Disaster Control.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                <span className="text-slate-700 dark:text-slate-300">
                  State Disaster: <strong className="text-amber-600 dark:text-amber-400">1070</strong>
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  District Disaster: <strong className="text-amber-600 dark:text-amber-400">1077</strong>
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  Police: <strong className="text-red-500">100</strong> | Fire: <strong className="text-red-500">101</strong> | Ambulance: <strong className="text-red-500">108</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            MyGovt AI Hub • Verified Municipal Connect
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
