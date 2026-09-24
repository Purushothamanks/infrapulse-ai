'use client';

import React, { useState } from 'react';
import { HazardReport } from '@/types/hazard';
import { MapPin, Flame, Layers, Eye, Navigation, Crosshair, AlertCircle } from 'lucide-react';

interface CityMapViewProps {
  hazards: HazardReport[];
  selectedHazard: HazardReport | null;
  onSelectHazard: (hazard: HazardReport) => void;
}

export const CityMapView: React.FC<CityMapViewProps> = ({
  hazards,
  selectedHazard,
  onSelectHazard
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [hoveredHazard, setHoveredHazard] = useState<HazardReport | null>(null);

  // Color mapping based on urgency/type
  const getHazardColor = (hazard: HazardReport) => {
    if (hazard.urgency === 'CRITICAL') return '#ef4444'; // Red
    if (hazard.type === 'water_leak') return '#06b6d4'; // Cyan
    if (hazard.type === 'illegal_waste') return '#10b981'; // Green
    if (hazard.type === 'structural_crack') return '#f59e0b'; // Amber
    if (hazard.type === 'solar_infrastructure') return '#eab308'; // Yellow
    return '#f97316'; // Orange
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[480px] lg:h-[580px] rounded-2xl sm:rounded-3xl bg-slate-950 border border-emerald-900/40 shadow-2xl overflow-hidden group">
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-slate-800 text-[10px] sm:text-xs font-mono shadow-lg truncate">
          <Crosshair className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400 animate-spin shrink-0" />
          <span className="text-slate-300 truncate">GRID: METRO_SOUTH</span>
          <span className="text-emerald-400 font-bold hidden md:inline">12.9716° N, 77.5946° E</span>
        </div>

        {/* Map Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-medium border transition-all cursor-pointer shadow-lg backdrop-blur-md ${
              showHeatmap
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>Heatmap</span>
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-medium border transition-all cursor-pointer shadow-lg backdrop-blur-md ${
              showGrid
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      {/* Interactive High-Tech Vector City Canvas */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Radial Heatmap Gradients */}
          <radialGradient id="heatCritical" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heatWater" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heatEco" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#059669" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeOpacity="0.4" />
          </pattern>
        </defs>

        {/* Base Map Background */}
        <rect width="1000" height="800" fill="#030712" />

        {/* Grid Layer */}
        {showGrid && <rect width="1000" height="800" fill="url(#gridPattern)" />}

        {/* City Geography: River / Water Body */}
        <path
          d="M -50 420 C 150 400, 300 480, 480 430 C 660 380, 800 460, 1050 410 L 1050 470 C 800 520, 660 440, 480 490 C 300 540, 150 460, -50 480 Z"
          fill="#082f49"
          fillOpacity="0.45"
        />

        {/* Major Arterial Expressways */}
        <g stroke="#1e293b" strokeWidth="14" fill="none" strokeLinecap="round">
          {/* Ring Road */}
          <path d="M 120 180 Q 500 80 880 220 Q 940 500 820 700 Q 480 760 160 680 Q 80 450 120 180 Z" />
          {/* Central Crossing Expressway */}
          <path d="M 0 350 L 1000 350" />
          <path d="M 460 0 L 460 800" />
          <path d="M 150 750 L 850 100" />
        </g>

        {/* Glowing Road Centerlines */}
        <g stroke="#334155" strokeWidth="2" strokeDasharray="8 6" fill="none">
          <path d="M 120 180 Q 500 80 880 220 Q 940 500 820 700 Q 480 760 160 680 Q 80 450 120 180 Z" />
          <path d="M 0 350 L 1000 350" />
          <path d="M 460 0 L 460 800" />
        </g>

        {/* City Ward Zoning Labels */}
        <g fill="#475569" fontSize="11" fontFamily="monospace" fontWeight="600" opacity="0.6">
          <text x="180" y="240">WARD 2: WEST INDUSTRIAL</text>
          <text x="560" y="180">WARD 4: EAST TECH CORRIDOR</text>
          <text x="240" y="660">WARD 7: SOUTH CENTRAL</text>
          <text x="680" y="620">WARD 9: ECOLOGICAL BUFFER</text>
        </g>

        {/* Heatmap Layer */}
        {showHeatmap &&
          hazards.map((hazard) => {
            const radius = (hazard.severity / 100) * 110 + 40;
            const grad =
              hazard.urgency === 'CRITICAL'
                ? 'url(#heatCritical)'
                : hazard.type === 'water_leak'
                ? 'url(#heatWater)'
                : 'url(#heatEco)';
            return (
              <circle
                key={`heat-${hazard.id}`}
                cx={hazard.location.x}
                cy={hazard.location.y}
                r={radius}
                fill={grad}
                className="animate-pulse duration-1000"
              />
            );
          })}

        {/* Live Hazard Pins with Pulsing Radar Effect */}
        {hazards.map((hazard) => {
          const color = getHazardColor(hazard);
          const isSelected = selectedHazard?.id === hazard.id;

          return (
            <g
              key={`pin-${hazard.id}`}
              transform={`translate(${hazard.location.x}, ${hazard.location.y})`}
              className="cursor-pointer transition-transform transform hover:scale-125"
              onClick={() => onSelectHazard(hazard)}
              onMouseEnter={() => setHoveredHazard(hazard)}
              onMouseLeave={() => setHoveredHazard(null)}
            >
              {/* Pulsing Radar Ring on Critical items */}
              {hazard.urgency === 'CRITICAL' && (
                <>
                  <circle cx="0" cy="0" r="22" fill={color} fillOpacity="0.25">
                    <animate attributeName="r" values="10;32;10" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="0" r="14" fill={color} fillOpacity="0.3" />
                </>
              )}

              {/* Pin Base Shadow */}
              <circle cx="0" cy="0" r="8" fill="#020617" />
              {/* Pin Core */}
              <circle
                cx="0"
                cy="0"
                r={isSelected ? 9 : 7}
                fill={color}
                stroke={isSelected ? '#ffffff' : '#020617'}
                strokeWidth={isSelected ? 3 : 2}
                className="transition-all"
              />

              {/* Severity Number Tag */}
              <g transform="translate(12, -8)">
                <rect
                  x="0"
                  y="-10"
                  width="30"
                  height="16"
                  rx="4"
                  fill="#0f172a"
                  stroke={color}
                  strokeWidth="1"
                  fillOpacity="0.9"
                />
                <text
                  x="15"
                  y="2"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {hazard.severity}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Card */}
      {hoveredHazard && (
        <div
          className="absolute z-30 pointer-events-none bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-xs transition-all text-xs"
          style={{
            left: `${Math.min(Math.max(hoveredHazard.location.x / 10, 15), 75)}%`,
            top: `${Math.min(Math.max(hoveredHazard.location.y / 8, 15), 70)}%`
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-white truncate">{hoveredHazard.title}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                hoveredHazard.urgency === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              {hoveredHazard.urgency}
            </span>
          </div>
          <p className="text-slate-400 mt-1 line-clamp-1">{hoveredHazard.location.address}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-emerald-400">
            <span>AI CONFIDENCE: {hoveredHazard.aiAnalysis.confidence}%</span>
            <span>SEV: {hoveredHazard.severity}/100</span>
          </div>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span>Critical Road Crater / Live Shock</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Water Leak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Structural Fissure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Illegal Waste</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <span>Click any pin to inspect with AI Vision</span>
        </div>
      </div>
    </div>
  );
};
