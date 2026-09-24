'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { HazardReport, HazardType, getHazardProgress } from '@/types/hazard';
import { LocationPickerMap } from './LocationPickerMap';
import { ThemeToggle } from './ThemeToggle';
import { TnGovHelpModal } from './TnGovHelpModal';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogOut,
  ShieldAlert,
  Loader2,
  FileText,
  Activity,
  Droplet,
  Truck,
  Zap,
  Sun,
  LifeBuoy,
  Trash2,
  PhoneCall,
  Sparkles
} from 'lucide-react';

interface CitizenPortalProps {
  hazards: HazardReport[];
  onAddHazard: (newReport: HazardReport) => void;
  onDeleteHazard?: (hazardId: string) => void;
}

const CATEGORIES: Array<{
  type: HazardType;
  label: string;
  icon: any;
  sampleFile: string;
  defaultAddress: string;
  defaultWard: string;
}> = [
  {
    type: 'pothole',
    label: 'Road Pothole / Crater',
    icon: AlertTriangle,
    sampleFile: '/sample-hazards/1_severe_pothole_crater.png',
    defaultAddress: 'Outer Ring Road, Near Tech Corridor',
    defaultWard: 'Ward 4 - East Tech Corridor'
  },
  {
    type: 'water_leak',
    label: 'Water Main Leak / Flood',
    icon: Droplet,
    sampleFile: '/sample-hazards/2_water_main_rupture.png',
    defaultAddress: '80 Feet Road, 4th Block Urban Sector',
    defaultWard: 'Ward 7 - South Central'
  },
  {
    type: 'structural_crack',
    label: 'Flyover / Bridge Crack',
    icon: ShieldAlert,
    sampleFile: '/sample-hazards/3_structural_flyover_crack.png',
    defaultAddress: 'Pillar #42, Metro Expressway',
    defaultWard: 'Ward 2 - West Industrial'
  },
  {
    type: 'illegal_waste',
    label: 'Illegal Waste Dumping',
    icon: Truck,
    sampleFile: '/sample-hazards/4_illegal_waste_dump.png',
    defaultAddress: 'Lakeside Greenway Buffer Zone',
    defaultWard: 'Ward 9 - North Ecological Reserve'
  },
  {
    type: 'electrical_hazard',
    label: 'Broken Streetlight / Shock Risk',
    icon: Zap,
    sampleFile: '/sample-hazards/5_broken_smart_streetlight.png',
    defaultAddress: 'Pedestrian Crosswalk, School Zone 12',
    defaultWard: 'Ward 5 - South Hub'
  },
  {
    type: 'solar_infrastructure',
    label: 'Solar Grid / Renewable Issue',
    icon: Sun,
    sampleFile: '/sample-hazards/6_solar_grid_damage.png',
    defaultAddress: 'Community Center Solar Rooftop',
    defaultWard: 'Ward 11 - East Suburbs'
  }
];

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  hazards,
  onAddHazard,
  onDeleteHazard
}) => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'raise' | 'history'>('raise');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [selectedType, setSelectedType] = useState<HazardType>('pothole');
  const [selectedImage, setSelectedImage] = useState<string>('/sample-hazards/1_severe_pothole_crater.png');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample-pothole');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('Outer Ring Road, Near Tech Corridor');
  const [ward, setWard] = useState<string>('Ward 4 - East Tech Corridor');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [successSubmitted, setSuccessSubmitted] = useState<boolean>(false);

  // Filter complaints reported by citizen
  const citizenComplaints = hazards;

  const handleCategorySelect = (cat: (typeof CATEGORIES)[0]) => {
    setSelectedType(cat.type);
    setSelectedImage(cat.sampleFile);
    setSelectedSampleId(`sample-${cat.type}`);
    setAddress(cat.defaultAddress);
    setWard(cat.defaultWard);
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
    setAnalysisProgress('Running Computer Vision Triage on uploaded photo...');

    try {
      setTimeout(() => setAnalysisProgress('Cross-referencing Municipal GIS & Geo-Deduplication...'), 400);

      const res = await fetch('/api/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleId: selectedSampleId,
          description: description || `Civilian report: ${selectedType}`,
          lat: coords.lat,
          lng: coords.lng
        })
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        const newReport: HazardReport = {
          id: `HZ-2026-${Math.floor(9200 + Math.random() * 799)}`,
          title: data.analysis.hazardLabel,
          type: data.analysis.hazardType,
          severity: data.analysis.severityScore,
          urgency: data.analysis.urgencyLevel,
          status: 'NOT_STARTED',
          location: {
            lat: coords.lat,
            lng: coords.lng,
            x: 500,
            y: 400,
            address: address || 'Reported Location',
            ward: ward || 'Ward 1 - Metro Central'
          },
          imageUrl: selectedImage,
          reportedAt: 'Just now',
          citizenName: user?.name || 'Registered Civilian',
          upvotes: 1,
          aiAnalysis: data.analysis
        };

        onAddHazard(newReport);
        setSuccessSubmitted(true);
        try {
          const confettiModule = await import('canvas-confetti');
          const confettiFn = confettiModule.default || confettiModule;
          confettiFn({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch (_) {}

        // Switch to history/track view after 1.5s
        setTimeout(() => {
          setSuccessSubmitted(false);
          setActiveTab('history');
        }, 1500);
      }
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const confirmDelete = (hazardId: string) => {
    if (onDeleteHazard) {
      onDeleteHazard(hazardId);
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 transition-colors pb-24 lg:pb-8">
      {/* Citizen Portal Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20 shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  InfraPulse <span className="text-cyan-600 dark:text-cyan-400 font-mono text-xs sm:text-sm">CITIZEN DESK</span>
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  CIVILIAN ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Report Public Hazards & Track Municipal Action SLA
              </p>
            </div>
          </div>

          {/* Header Action Buttons: Light/Dark Mode + TN Govt Help + Profile + Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* TN Govt Help Button in Header */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
              title="Tamil Nadu Government Citizen Helpline"
            >
              <LifeBuoy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">TN Govt Help</span>
            </button>

            {/* User Profile Tag */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <div className="text-left hidden md:block">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[110px]">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Verified Citizen</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs (Raise Grievance vs Track Grievances) */}
        <div className="flex rounded-2xl bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 shadow-md max-w-md mx-auto transition-colors">
          <button
            onClick={() => setActiveTab('raise')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'raise'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Raise New Grievance</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Track Status ({citizenComplaints.length})</span>
          </button>
        </div>

        {/* TAB 1: RAISE COMPLAINT FORM */}
        {activeTab === 'raise' && (
          <div className="max-w-3xl mx-auto rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-8 space-y-6 backdrop-blur-md transition-colors">
            {successSubmitted && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block">Grievance Successfully Lodged!</span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">
                    AI verification complete. Your report has been dispatched to the Municipal Admin Command Center.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Category Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-3">
                  Step 1: Select Infrastructure Problem Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedType === cat.type;
                    const Icon = cat.icon;
                    return (
                      <button
                        type="button"
                        key={cat.type}
                        onClick={() => handleCategorySelect(cat)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-start gap-2 ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-950 dark:text-white shadow-md shadow-emerald-500/10'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Photo Upload */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-3">
                  Step 2: Upload Hazard Photo (Or Choose from Category Field Samples)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl bg-slate-50 dark:bg-slate-950 cursor-pointer transition-colors group">
                    <Camera className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mb-2 transition-colors" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Take Photo or Upload</span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, WebP images</span>
                    <input type="file" accept="image/*" onChange={handleCustomFileUpload} className="hidden" />
                  </label>

                  {/* Image Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 aspect-video flex items-center justify-center shadow-xs">
                    {selectedImage ? (
                      <>
                        <img src={selectedImage} alt="Hazard preview" className="w-full h-full object-cover" />
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                            <span className="text-xs font-mono font-bold text-emerald-300">{analysisProgress}</span>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono border border-slate-700">
                          TARGET IMAGE READY
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">No photo selected</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Interactive Location Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-3">
                  Step 3: Pinpoint Exact Hazard Location on GIS Map
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

              {/* Step 4: Address & Ward */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Detected Street Address
                  </label>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street / Landmark..."
                      className="bg-transparent w-full outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Municipal Ward</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
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

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Additional Notes / Landmarks (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe severity, hazards to vehicles/pedestrians, or exact landmark..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none resize-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedImage || isAnalyzing}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing with AI Vision...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-slate-950" />
                    <span>Submit Grievance to Municipal Portal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: MY GRIEVANCES & LIVE STATUS TRACKER */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Live Grievance Tracking Timeline</span>
              </h3>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {citizenComplaints.length} Total Incidents
              </span>
            </div>

            {citizenComplaints.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No active grievances logged</h4>
                <p className="text-xs text-slate-500">You haven&apos;t reported any civic hazards yet.</p>
                <button
                  onClick={() => setActiveTab('raise')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Raise a Complaint
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {citizenComplaints.map((hazard) => {
                  const isCritical = hazard.urgency === 'CRITICAL';
                  const progress = getHazardProgress(hazard.status);

                  return (
                    <div
                      key={hazard.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all relative group"
                    >
                      {/* Top Header: Image, Title, Urgency, and DELETE BUTTON */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={hazard.imageUrl}
                            alt={hazard.title}
                            className="w-14 h-14 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                                {hazard.id}
                              </span>
                              <span
                                className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                  isCritical
                                    ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                                }`}
                              >
                                {hazard.urgency}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                              {hazard.title}
                            </h4>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              {hazard.location.address}
                            </span>
                          </div>
                        </div>

                        {/* DELETE BUTTON WITH TRASH ICON */}
                        <button
                          type="button"
                          onClick={() => setDeletingId(hazard.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
                          title="Delete / Withdraw this complaint"
                          aria-label="Delete Complaint"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* LIVE STATUS BADGE SELECTED BY ADMIN */}
                      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Municipal Progress:</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono ${
                            progress === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                              : progress === 'In progress'
                              ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 animate-pulse'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                          }`}
                        >
                          {progress === 'Completed' && '✓ '}
                          {progress === 'In progress' && '⚡ '}
                          {progress === 'Not started' && '⏳ '}
                          {progress}
                        </span>
                      </div>

                      {/* 3-Step Visual Progress Timeline */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          {/* Step 1: Registered */}
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>1. Not started</span>
                          </div>

                          <div
                            className={`w-6 sm:w-8 h-0.5 transition-colors ${
                              progress === 'In progress' || progress === 'Completed'
                                ? 'bg-cyan-500'
                                : 'bg-slate-300 dark:bg-slate-800'
                            }`}
                          />

                          {/* Step 2: In progress */}
                          <div
                            className={`flex items-center gap-1 ${
                              progress === 'In progress' || progress === 'Completed'
                                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                                : 'text-slate-400 dark:text-slate-600'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>2. In progress</span>
                          </div>

                          <div
                            className={`w-6 sm:w-8 h-0.5 transition-colors ${
                              progress === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'
                            }`}
                          />

                          {/* Step 3: Completed */}
                          <div
                            className={`flex items-center gap-1 ${
                              progress === 'Completed'
                                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'text-slate-400 dark:text-slate-600'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>3. Completed</span>
                          </div>
                        </div>
                      </div>

                      {/* Work Order Info if Dispatched */}
                      {hazard.workOrder && (
                        <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/30 text-xs flex items-center justify-between">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                              Assigned Municipal Contractor
                            </span>
                            <span className="font-semibold text-cyan-800 dark:text-cyan-300">
                              {hazard.workOrder.contractorTeam}
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-mono text-[10px]">
                            {hazard.workOrder.status}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* USER PAGE FIXED BOTTOM NAVIGATION:
          Left: Raise
          Center: Track (Prominent & highlighted)
          Right: Help & Support (TN Govt details) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          {/* Left: Raise Grievance */}
          <button
            type="button"
            onClick={() => setActiveTab('raise')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'raise'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-[10px]">Raise</span>
          </button>

          {/* CENTER: TRACK OPTION (Prominent Center Button) */}
          <div className="relative -top-3">
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/40 ring-4 ring-emerald-500/20'
                  : 'bg-slate-900 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-slate-700 dark:border-emerald-500/40'
              }`}
              title="Track submitted grievances"
            >
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Track</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-950 text-white">
                {citizenComplaints.length}
              </span>
            </button>
          </div>

          {/* Right: Help & Support (TN Govt Helpline) */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
            title="Tamil Nadu Government Official Help & Support"
          >
            <LifeBuoy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-semibold">Help & Support</span>
          </button>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Delete Grievance?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to withdraw and delete complaint ID{' '}
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{deletingId}</span>? It will be removed from the municipal triage system.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(deletingId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TN GOVERNMENT OFFICIAL HELP & SUPPORT MODAL */}
      <TnGovHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};
