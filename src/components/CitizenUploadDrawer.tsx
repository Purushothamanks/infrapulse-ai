'use client';

import React, { useState } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  MapPin,
  Loader2
} from 'lucide-react';
import { HazardReport, HazardType } from '@/types/hazard';
import { LocationPickerMap } from './LocationPickerMap';

interface CitizenUploadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHazard: (newHazard: HazardReport) => void;
  initialCoords?: { lat: number; lng: number };
}

const sampleHazards = [
  {
    id: 'sample-pothole',
    label: 'Deep Road Crater',
    file: '/sample-hazards/1_severe_pothole_crater.png',
    type: 'pothole',
    address: 'Outer Ring Road, Near Tech Corridor',
    ward: 'Ward 4 - East Tech Corridor',
    lat: 12.9716,
    lng: 77.5946
  },
  {
    id: 'sample-water',
    label: 'Water Main Burst',
    file: '/sample-hazards/2_water_main_rupture.png',
    type: 'water_leak',
    address: '80 Feet Road, 4th Block Urban Sector',
    ward: 'Ward 7 - South Central',
    lat: 12.9352,
    lng: 77.6245
  },
  {
    id: 'sample-crack',
    label: 'Flyover Pillar Crack',
    file: '/sample-hazards/3_structural_flyover_crack.png',
    type: 'structural_crack',
    address: 'Pillar #42, Metro Expressway',
    ward: 'Ward 2 - West Industrial',
    lat: 12.9856,
    lng: 77.5367
  },
  {
    id: 'sample-waste',
    label: 'Illegal Waste Dump',
    file: '/sample-hazards/4_illegal_waste_dump.png',
    type: 'illegal_waste',
    address: 'Lakeside Greenway Buffer Zone',
    ward: 'Ward 9 - North Ecological Reserve',
    lat: 12.9128,
    lng: 77.6389
  },
  {
    id: 'sample-light',
    label: 'Broken Streetlight',
    file: '/sample-hazards/5_broken_smart_streetlight.png',
    type: 'electrical_hazard',
    address: 'Pedestrian Crosswalk, School Zone 12',
    ward: 'Ward 5 - South Hub',
    lat: 12.9645,
    lng: 77.589
  },
  {
    id: 'sample-solar',
    label: 'Damaged Solar Grid',
    file: '/sample-hazards/6_solar_grid_damage.png',
    type: 'solar_infrastructure',
    address: 'Community Center Solar Rooftop',
    ward: 'Ward 11 - East Suburbs',
    lat: 12.9912,
    lng: 77.6521
  }
];

export const CitizenUploadDrawer: React.FC<CitizenUploadDrawerProps> = ({
  isOpen,
  onClose,
  onAddHazard,
  initialCoords
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('/sample-hazards/1_severe_pothole_crater.png');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample-pothole');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('Outer Ring Road, Near Tech Corridor');
  const [ward, setWard] = useState<string>('Ward 4 - East Tech Corridor');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    initialCoords || { lat: 12.9716, lng: 77.5946 }
  );

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectSample = (sample: (typeof sampleHazards)[0]) => {
    setSelectedSampleId(sample.id);
    setSelectedImage(sample.file);
    setAddress(sample.address);
    setWard(sample.ward);
    setCoords({ lat: sample.lat, lng: sample.lng });
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setSelectedSampleId('custom-upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisProgress('Running Computer Vision Segmentation...');

    try {
      setTimeout(() => setAnalysisProgress('Quantifying Hazard Severity Index & Geo-Deduplication...'), 300);

      const res = await fetch('/api/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleId: selectedSampleId,
          description,
          lat: coords.lat,
          lng: coords.lng
        })
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        const randomX = Math.floor(200 + Math.random() * 600);
        const randomY = Math.floor(200 + Math.random() * 400);

        const newReport: HazardReport = {
          id: `HZ-2026-${Math.floor(9100 + Math.random() * 899)}`,
          title: data.analysis.hazardLabel,
          type: data.analysis.hazardType,
          severity: data.analysis.severityScore,
          urgency: data.analysis.urgencyLevel,
          status: 'NOT_STARTED',
          location: {
            lat: coords.lat,
            lng: coords.lng,
            x: randomX,
            y: randomY,
            address: address || 'Reported Location',
            ward: ward || 'Ward 1 - Metro Central'
          },
          imageUrl: selectedImage,
          reportedAt: 'Just now',
          citizenName: 'Citizen App User',
          upvotes: 1,
          aiAnalysis: data.analysis
        };

        onAddHazard(newReport);
        try {
          const confettiModule = await import('canvas-confetti');
          const confettiFn = confettiModule.default || confettiModule;
          confettiFn({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        } catch (_) {}
        onClose();
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700/80 shadow-2xl flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Civic Hazard Scanner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI Computer Vision & Precise Location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
          {/* 1-Click Demo Sample Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Demo Samples
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Ready to test</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sampleHazards.map((sample) => (
                <button
                  type="button"
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    selectedSampleId === sample.id
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-950 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <img
                    src={sample.file}
                    alt={sample.label}
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                  <span className="text-[10px] font-medium text-center line-clamp-1">{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom File Upload Option */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
              Or Upload Custom Field Photo
            </span>
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl bg-slate-50 dark:bg-slate-950/60 cursor-pointer transition-colors group">
              <Upload className="w-7 h-7 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mb-1.5 transition-colors" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Tap to upload or take photo</span>
              <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP from camera</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 aspect-video flex items-center justify-center shadow-xs">
              <img
                src={selectedImage}
                alt="Selected preview"
                className="w-full h-full object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                  <span className="text-xs font-mono font-bold text-emerald-300">{analysisProgress}</span>
                </div>
              )}
            </div>
          )}

          {/* Location Picker */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
              Interactive Hazard Location (Google Maps Pin)
            </label>
            <LocationPickerMap
              initialLat={coords.lat}
              initialLng={coords.lng}
              onLocationSelect={(lat, lng, fetchedAddress) => {
                setCoords({ lat, lng });
                if (fetchedAddress) setAddress(fetchedAddress);
              }}
            />
          </div>

          {/* Address Details */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Detected Street Address
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street / Landmark..."
                  className="bg-transparent w-full outline-none text-slate-900 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Municipal Ward
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="Ward 1 - Metro Central">Ward 1 - Metro Central</option>
                <option value="Ward 2 - West Industrial">Ward 2 - West Industrial</option>
                <option value="Ward 4 - East Tech Corridor">Ward 4 - East Tech Corridor</option>
                <option value="Ward 5 - South Hub">Ward 5 - South Hub</option>
                <option value="Ward 7 - South Central">Ward 7 - South Central</option>
                <option value="Ward 9 - North Ecological Reserve">Ward 9 - North Ecological Reserve</option>
                <option value="Ward 11 - East Suburbs">Ward 11 - East Suburbs</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Notes / Severity (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on physical severity, traffic blockages, or nearby landmarks..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 outline-none resize-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <button
            onClick={handleSubmit}
            disabled={!selectedImage || isAnalyzing}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Computer Vision Triage...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>Submit & Run AI Triage</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
