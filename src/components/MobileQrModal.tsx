'use client';

import React from 'react';
import { X, Smartphone, ExternalLink, Wifi, Copy, Check } from 'lucide-react';

interface MobileQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicUrl: string;
  localWifiUrl: string;
}

export const MobileQrModal: React.FC<MobileQrModalProps> = ({
  isOpen,
  onClose,
  publicUrl,
  localWifiUrl
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Open on Mobile Device</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scan QR Code or visit live URL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="my-5 flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/30">
            <img
              src="/mobile-qr.png"
              alt="Scan to open on mobile"
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-mono">
            Point your mobile camera at this QR code to open
          </p>
        </div>

        {/* Public Cloudflare HTTPS Link */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Public Cloudflare HTTPS URL:
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="bg-transparent flex-1 font-mono text-emerald-700 dark:text-emerald-400 outline-none truncate select-all"
            />
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1 font-sans cursor-pointer text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Local Wi-Fi Subnet Link */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Same Wi-Fi Network:
          </span>
          <a
            href={localWifiUrl}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            {localWifiUrl}
          </a>
        </div>
      </div>
    </div>
  );
};
