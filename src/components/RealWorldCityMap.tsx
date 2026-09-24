'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HazardReport } from '@/types/hazard';
import {
  Layers,
  Flame,
  Navigation,
  Crosshair,
  AlertTriangle,
  MapPin,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import type * as LType from 'leaflet';

interface RealWorldCityMapProps {
  hazards: HazardReport[];
  selectedHazard: HazardReport | null;
  onSelectHazard: (hazard: HazardReport) => void;
  onDropPinReport?: (lat: number, lng: number) => void;
}

export const RealWorldCityMap: React.FC<RealWorldCityMapProps> = ({
  hazards,
  selectedHazard,
  onSelectHazard,
  onDropPinReport
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const markersRef = useRef<Map<string, LType.Marker>>(new Map());
  const heatCirclesRef = useRef<LType.Circle[]>([]);
  const tileLayerRef = useRef<LType.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946
  });

  const getMarkerColor = (hazard: HazardReport) => {
    if (hazard.urgency === 'CRITICAL') return '#ef4444'; // Red
    if (hazard.type === 'water_leak') return '#06b6d4'; // Cyan
    if (hazard.type === 'illegal_waste') return '#10b981'; // Green
    if (hazard.type === 'structural_crack') return '#f59e0b'; // Amber
    if (hazard.type === 'solar_infrastructure') return '#eab308'; // Yellow
    return '#f97316'; // Orange
  };

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!isMounted) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [centerCoords.lat, centerCoords.lng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Streets (Google Maps style)
      const streetLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );
      streetLayer.addTo(map);
      tileLayerRef.current = streetLayer;

      mapInstanceRef.current = map;

      // Click on map to drop pin or select
      map.on('click', (e: LType.LeafletMouseEvent) => {
        if (onDropPinReport) {
          onDropPinReport(e.latlng.lat, e.latlng.lng);
        }
      });

      renderMarkers(L, map);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render markers and heatmap circles
  const renderMarkers = (L: typeof import('leaflet'), map: LType.Map) => {
    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    // Clear old heat circles
    heatCirclesRef.current.forEach((c) => c.remove());
    heatCirclesRef.current = [];

    hazards.forEach((hazard) => {
      const color = getMarkerColor(hazard);
      const isCritical = hazard.urgency === 'CRITICAL';

      // Heat circle around hazard
      if (showHeatmap) {
        const circle = L.circle([hazard.location.lat, hazard.location.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.15,
          radius: (hazard.severity / 100) * 800 + 200,
          weight: 1
        }).addTo(map);
        heatCirclesRef.current.push(circle);
      }

      // Custom pulsing HTML Pin Marker
      const customIcon = L.divIcon({
        className: 'custom-pulsing-marker',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${
              isCritical
                ? `<div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="width: 28px; height: 28px; background: #0f172a; border: 2.5px solid ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
              <span style="color: #ffffff; font-size: 10px; font-weight: bold; font-family: monospace;">${
                hazard.severity
              }</span>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([hazard.location.lat, hazard.location.lng], {
        icon: customIcon
      }).addTo(map);

      // Popup Content
      const popupContent = `
        <div style="min-width: 190px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
            <span style="font-weight: bold; font-size: 13px; color: #f8fafc;">${hazard.title}</span>
            <span style="font-size: 10px; font-family: monospace; font-weight: bold; background: ${color}33; color: ${color}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${color}66;">
              ${hazard.urgency}
            </span>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.3;">${hazard.location.address}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-family: monospace; color: #34d399;">
            <span>AI CONF: ${hazard.aiAnalysis.confidence}%</span>
            <span>SEV: ${hazard.severity}/100</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { offset: [0, -10] });

      marker.on('click', () => {
        onSelectHazard(hazard);
      });

      markersRef.current.set(hazard.id, marker);
    });
  };

  // Re-render markers when hazards or heatmap toggle changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      if (mapInstanceRef.current) {
        renderMarkers(L.default, mapInstanceRef.current);
      }
    });
  }, [hazards, showHeatmap]);

  // Focus map on selected hazard
  useEffect(() => {
    if (selectedHazard && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedHazard.location.lat, selectedHazard.location.lng],
        15,
        { duration: 1.2 }
      );
      const marker = markersRef.current.get(selectedHazard.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedHazard]);

  // Toggle Map Style (Roadmap vs High-Res Satellite)
  const toggleMapStyle = async () => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const L = (await import('leaflet')).default;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    if (mapStyle === 'streets') {
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );
      satelliteLayer.addTo(mapInstanceRef.current);
      tileLayerRef.current = satelliteLayer;
      setMapStyle('satellite');
    } else {
      const streetLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );
      streetLayer.addTo(mapInstanceRef.current);
      tileLayerRef.current = streetLayer;
      setMapStyle('streets');
    }
  };

  // Reset to City Center
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([centerCoords.lat, centerCoords.lng], 12, {
        duration: 1
      });
    }
  };

  // Locate Current GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current?.flyTo([latitude, longitude], 15, { duration: 1.2 });
      },
      () => {},
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[580px] rounded-2xl sm:rounded-3xl bg-slate-950 border border-emerald-900/40 shadow-2xl overflow-hidden group">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Top Map HUD Bar */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-slate-800 text-[10px] sm:text-xs font-mono shadow-lg truncate">
          <Crosshair className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400 animate-spin shrink-0" />
          <span className="text-slate-200 font-semibold truncate">
            {mapStyle === 'streets' ? 'ROADMAP' : 'SATELLITE'}
          </span>
          <span className="text-emerald-400 font-bold hidden md:inline">
            12.9716° N, 77.5946° E
          </span>
        </div>

        {/* Map Controls Header */}
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
            onClick={toggleMapStyle}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-medium border transition-all cursor-pointer shadow-lg backdrop-blur-md ${
              mapStyle === 'satellite'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>{mapStyle === 'streets' ? 'Satellite' : 'Roadmap'}</span>
          </button>

          <button
            onClick={handleResetView}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-800 hover:text-white shadow-lg backdrop-blur-md cursor-pointer"
            title="Reset City View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleLocateMe}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 text-emerald-400 border border-slate-800 hover:text-emerald-300 shadow-lg backdrop-blur-md cursor-pointer"
            title="Locate My GPS"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 sm:left-4 right-14 sm:right-16 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-slate-800 text-[10px] sm:text-[11px] font-mono text-slate-300 pointer-events-auto">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Water</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Structural</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Waste</span>
          </div>
        </div>
      </div>
    </div>
  );
};
