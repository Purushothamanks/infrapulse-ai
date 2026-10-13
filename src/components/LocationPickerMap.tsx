'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Layers, Check, Loader2 } from 'lucide-react';
import type * as LType from 'leaflet';

interface LocationPickerMapProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialLat,
  initialLng,
  onLocationSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const markerRef = useRef<LType.Marker | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat || 12.9716,
    lng: initialLng || 77.5946
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const tileLayerRef = useRef<LType.TileLayer | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!isMounted) return;

      // Clean up previous map if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      // Default OpenStreetMap / Google-style Roadmap tiles
      const streetLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );

      streetLayer.addTo(map);
      tileLayerRef.current = streetLayer;

      // Custom Pin Icon
      const customIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 28px;
              height: 28px;
              background: #10b981;
              border: 3px solid #ffffff;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 10px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: #020617;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      // Create draggable marker
      const marker = L.marker([coords.lat, coords.lng], {
        icon: customIcon,
        draggable: true
      }).addTo(map);

      // Handle marker drag
      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        setCoords({ lat: position.lat, lng: position.lng });
        reverseGeocode(position.lat, position.lng);
      });

      // Handle map click to drop marker
      map.on('click', async (e: LType.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Trigger map resize check
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
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

  // Synchronize when parent updates initialLat/initialLng
  useEffect(() => {
    if (initialLat && initialLng) {
      setCoords({ lat: initialLat, lng: initialLng });
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([initialLat, initialLng]);
        mapInstanceRef.current.setView([initialLat, initialLng], mapInstanceRef.current.getZoom());
      }
    }
  }, [initialLat, initialLng]);

  // Reverse Geocoding Helper with robust fallback
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const address =
          data.display_name?.split(',').slice(0, 3).join(', ') ||
          `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        onLocationSelect(lat, lng, address);
        return;
      }
    } catch (_) {}
    onLocationSelect(lat, lng, `Location (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
  };

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

  // Handle GPS Locate Me with High Accuracy and Fallbacks
  const handleLocateMe = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser device.');
      return;
    }

    setIsLocating(true);

    const onSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.flyTo([latitude, longitude], 16);
        markerRef.current.setLatLng([latitude, longitude]);
      }
      reverseGeocode(latitude, longitude);
      setIsLocating(false);
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn('GPS location attempt error:', err);
      // If high accuracy timed out, try fast low accuracy fallback
      if (err.code === 3) {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          () => {
            setIsLocating(false);
            alert('GPS satellite lock timed out. Please tap anywhere directly on the map to place your pin.');
          },
          { enableHighAccuracy: false, timeout: 8000 }
        );
        return;
      }

      setIsLocating(false);
      if (err.code === 1) {
        alert('Location permission was denied. Please allow location permissions in your browser or device settings.');
      } else {
        alert('Unable to acquire device GPS coordinates. Please click or tap on the map to set location.');
      }
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Interactive Location Pin (Click / Drag to select)</span>
        </label>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
          {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
        </span>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Map Controls */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={toggleMapStyle}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-md backdrop-blur-md text-[10px] flex items-center gap-1 font-semibold cursor-pointer transition-colors"
            title="Toggle Satellite / Road Map"
          >
            <Layers className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
            <span>{mapStyle === 'streets' ? 'Satellite' : 'Roadmap'}</span>
          </button>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-md backdrop-blur-md text-[10px] flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50 transition-colors"
            title="Use My Current GPS Location"
          >
            {isLocating ? (
              <Loader2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400 animate-spin" />
            ) : (
              <Navigation className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            )}
            <span>GPS</span>
          </button>
        </div>

        {/* Help Tip Overlay */}
        <div className="absolute bottom-2 left-2 z-20 pointer-events-none bg-white/85 dark:bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
          Tap anywhere on map to drop pin
        </div>
      </div>
    </div>
  );
};
