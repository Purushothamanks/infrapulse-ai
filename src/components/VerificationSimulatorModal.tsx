'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ScanEye,
  Sparkles,
  Cpu,
  Upload,
  RefreshCw,
  Camera,
  Layers,
  ArrowRight,
  Send,
  Sliders,
  Info
} from 'lucide-react';
import { VerificationTelemetry, AIAnalysisResult, HazardReport } from '@/types/hazard';

interface VerificationSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHazard?: (report: HazardReport) => void;
}

interface TestCase {
  id: string;
  title: string;
  category: string;
  tag: string;
  expectedVerdict: 'APPROVED' | 'REJECTED';
  imageUrl: string;
  description: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'test-real-pothole',
    title: 'Severe Road Crater',
    category: 'Road Infrastructure',
    tag: 'Authentic Camera Capture',
    expectedVerdict: 'APPROVED',
    imageUrl: '/sample-hazards/1_severe_pothole_crater.svg',
    description: 'Deep road asphalt crater with severe rim cavitation on municipal expressway.'
  },
  {
    id: 'test-animal-dog',
    title: 'Domestic Pet (Dog)',
    category: 'Mismatched Subject',
    tag: 'Domestic Animal',
    expectedVerdict: 'REJECTED',
    imageUrl: '/sample-hazards/test_case_animal_dog.svg',
    description: 'Photo of a domestic golden dog in an indoor living room.'
  },
  {
    id: 'test-ai-fake-pothole',
    title: 'AI-Generated Fake Pothole',
    category: 'Synthetic Generative AI',
    tag: 'Diffusion Model Artifacts',
    expectedVerdict: 'REJECTED',
    imageUrl: '/sample-hazards/test_case_ai_fake_pothole.svg',
    description: 'Hyper-smooth synthetic road hole generated via generative diffusion prompt.'
  },
  {
    id: 'test-indoor-room',
    title: 'Indoor Living Room / Sofa',
    category: 'Non-Infrastructure',
    tag: 'Residential Interior',
    expectedVerdict: 'REJECTED',
    imageUrl: '/sample-hazards/test_case_indoor_room.svg',
    description: 'Indoor living room sofa and wooden coffee table.'
  },
  {
    id: 'test-water-leak',
    title: 'Water Main Pipe Rupture',
    category: 'Water Utility',
    tag: 'Authentic Camera Capture',
    expectedVerdict: 'APPROVED',
    imageUrl: '/sample-hazards/2_water_main_rupture.svg',
    description: 'High-velocity potable water main burst flooding asphalt sub-base.'
  }
];

export const VerificationSimulatorModal: React.FC<VerificationSimulatorModalProps> = ({
  isOpen,
  onClose,
  onAddHazard
}) => {
  const [selectedCase, setSelectedCase] = useState<TestCase>(TEST_CASES[0]);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customDescription, setCustomDescription] = useState<string>('');
  
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [telemetry, setTelemetry] = useState<VerificationTelemetry | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [injectedToQueue, setInjectedToQueue] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run simulation whenever a test case is selected
  useEffect(() => {
    if (isOpen && !isCustomMode) {
      runVerification(selectedCase.id, selectedCase.imageUrl, selectedCase.description);
    }
  }, [isOpen, selectedCase, isCustomMode]);

  if (!isOpen) return null;

  const runVerification = async (caseId?: string, imageSrc?: string, desc?: string) => {
    setIsSimulating(true);
    setActiveStep(1);
    setTelemetry(null);
    setAnalysisResult(null);
    setInjectedToQueue(false);

    try {
      // Step visualizer animation sequence
      setTimeout(() => setActiveStep(2), 350);
      setTimeout(() => setActiveStep(3), 700);

      const targetImage = imageSrc || customImage || selectedCase.imageUrl;
      const targetDesc = desc || customDescription || selectedCase.description;

      const res = await fetch('/api/verify-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseId: isCustomMode ? undefined : caseId || selectedCase.id,
          imageBase64: targetImage,
          description: targetDesc
        })
      });

      const data = await res.json();
      setTimeout(() => {
        setActiveStep(4);
        if (data.success && data.telemetry) {
          setTelemetry(data.telemetry);
          if (data.analysis) {
            setAnalysisResult(data.analysis);
          }
        }
        setIsSimulating(false);
      }, 1000);
    } catch (err) {
      console.error('Simulator error:', err);
      setIsSimulating(false);
    }
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setCustomImage(dataUrl);
        setIsCustomMode(true);
        runVerification(undefined, dataUrl, customDescription || 'Custom uploaded photo');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInjectToLiveQueue = () => {
    if (!telemetry || telemetry.verdict !== 'APPROVED' || !analysisResult || !onAddHazard) return;

    const report: HazardReport = {
      id: `HZ-2026-${Math.floor(9300 + Math.random() * 699)}`,
      title: analysisResult.hazardLabel,
      type: analysisResult.hazardType,
      severity: analysisResult.severityScore,
      urgency: analysisResult.urgencyLevel,
      status: 'NOT_STARTED',
      location: {
        lat: 12.9716 + (Math.random() - 0.5) * 0.05,
        lng: 77.5946 + (Math.random() - 0.5) * 0.05,
        x: 500,
        y: 400,
        address: 'MG Road Expressway, Municipal Sector 4',
        ward: 'Ward 4 - East Tech Corridor'
      },
      imageUrl: isCustomMode && customImage ? customImage : selectedCase.imageUrl,
      reportedAt: 'Just now (Verified via Simulator)',
      citizenName: 'AI Verification Simulator',
      citizenEmail: 'mygovtaihub@gmail.com',
      upvotes: 3,
      aiAnalysis: analysisResult
    };

    onAddHazard(report);
    setInjectedToQueue(true);
  };

  const currentDisplayImage = isCustomMode && customImage ? customImage : selectedCase.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              <ScanEye className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Road Damage & Image Verification Simulator
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  DUAL-PILLAR AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pillar 1: Object Relevance Classification • Pillar 2: Synthetic AI Fake Detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Preset Test Case Selector & Custom Upload Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                SELECT INTERACTIVE TEST CASE OR UPLOAD CUSTOM:
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Click any case to run real-time dual-pillar inspection
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {TEST_CASES.map((tc) => {
                const isSelected = !isCustomMode && selectedCase.id === tc.id;
                return (
                  <button
                    key={tc.id}
                    onClick={() => {
                      setIsCustomMode(false);
                      setSelectedCase(tc);
                    }}
                    className={`p-2.5 rounded-2xl text-left transition-all border flex flex-col justify-between gap-1.5 cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                          tc.expectedVerdict === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : tc.id === 'test-ai-fake-pothole'
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                            : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tc.expectedVerdict}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {tc.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {tc.tag}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Custom Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-2xl text-left transition-all border flex flex-col justify-between gap-1.5 cursor-pointer relative ${
                  isCustomMode
                    ? 'bg-indigo-500/10 border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    LIVE CUSTOM
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-indigo-500" />
                    Upload File
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Test your photo
                  </div>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Interactive Simulation Dashboard: Left Preview + Right Audit Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 5 Cols: Visual Scanner Viewport */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center group">
                <img
                  src={currentDisplayImage}
                  alt="Inspection target"
                  className="w-full h-full object-cover"
                />

                {/* Laser Scanning Animation Overlay */}
                {isSimulating && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse absolute top-0 left-0 transition-all duration-1000 animate-scanline" />
                    <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[0.5px]" />
                    <div className="absolute top-3 left-3 bg-slate-900/90 text-cyan-400 px-2.5 py-1 rounded-lg text-[10px] font-mono border border-cyan-500/40 flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      SPECTRAL NOISE & SEMANTIC SCANNING...
                    </div>
                  </div>
                )}

                {/* Detected Object HUD Tag */}
                {!isSimulating && telemetry && (
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 flex items-center justify-between text-xs">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Detected Entity:
                      </div>
                      <div className="font-bold text-white truncate">
                        {telemetry.detectedObject}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
                        telemetry.verdict === 'APPROVED'
                          ? 'bg-emerald-500 text-slate-950'
                          : telemetry.rejectionType === 'AI_GENERATED_FAKE'
                          ? 'bg-purple-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {telemetry.verdict}
                    </span>
                  </div>
                )}
              </div>

              {/* Rerun Button */}
              <button
                onClick={() =>
                  runVerification(
                    selectedCase.id,
                    currentDisplayImage,
                    isCustomMode ? customDescription : selectedCase.description
                  )
                }
                disabled={isSimulating}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>Rerun Dual-Pillar AI Inspection</span>
              </button>
            </div>

            {/* Right 7 Cols: Real-Time Diagnostic Gauges & Step-by-Step Pipeline Audit */}
            <div className="lg:col-span-7 space-y-4">
              {/* FINAL VERDICT HERO BANNER */}
              {telemetry ? (
                <div
                  className={`p-4 rounded-2xl border transition-all animate-in fade-in duration-300 ${
                    telemetry.verdict === 'APPROVED'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-100'
                      : telemetry.rejectionType === 'AI_GENERATED_FAKE'
                      ? 'bg-purple-500/10 border-purple-500/40 text-purple-900 dark:text-purple-100'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        telemetry.verdict === 'APPROVED'
                          ? 'bg-emerald-500 text-white'
                          : telemetry.rejectionType === 'AI_GENERATED_FAKE'
                          ? 'bg-purple-600 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {telemetry.verdict === 'APPROVED' ? (
                        <ShieldCheck className="w-6 h-6" />
                      ) : (
                        <ShieldAlert className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">
                          GOVERNANCE VERDICT ENGINE:
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                            telemetry.verdict === 'APPROVED'
                              ? 'bg-emerald-500 text-white'
                              : telemetry.rejectionType === 'AI_GENERATED_FAKE'
                              ? 'bg-purple-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {telemetry.verdict === 'APPROVED'
                            ? 'APPROVED'
                            : telemetry.rejectionType === 'AI_GENERATED_FAKE'
                            ? 'SYNTHETIC FRAUD'
                            : 'REJECTED MISMATCH'}
                        </span>
                      </div>
                      <div className="text-sm font-bold mt-0.5">
                        {telemetry.verdict === 'APPROVED'
                          ? 'Approved for Immediate Municipal Dispatch'
                          : telemetry.rejectionType === 'AI_GENERATED_FAKE'
                          ? 'Rejected: Synthetic AI-Generated Image Detected'
                          : 'Rejected: Mismatched Subject / Non-Civil Hazard'}
                      </div>
                      <p className="text-xs opacity-90 mt-1 leading-relaxed">
                        {telemetry.rejectionReason ||
                          'Verified as genuine roadway defect with physical optical sensor noise and acceptable municipal engineering metrics.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Computing Dual-Pillar Verification Telemetry...</span>
                </div>
              )}

              {/* THREE CORE DIAGNOSTIC GAUGES */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* 1. Authenticity Score */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    OPTICAL AUTHENTICITY
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {telemetry ? `${telemetry.authenticityScore.toFixed(1)}%` : '--'}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full transition-all duration-500 ${
                        (telemetry?.authenticityScore || 0) > 70
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${telemetry?.authenticityScore || 0}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                    {telemetry?.isAiGenerated ? 'Synthetic Latents' : 'Physical Sensor'}
                  </span>
                </div>

                {/* 2. Defect Relevance Score */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    CIVIL RELEVANCE
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {telemetry ? `${telemetry.relevanceScore.toFixed(1)}%` : '--'}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full transition-all duration-500 ${
                        (telemetry?.relevanceScore || 0) > 60
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${telemetry?.relevanceScore || 0}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                    {(telemetry?.relevanceScore || 0) > 60
                      ? 'Recognized Defect'
                      : 'Mismatched'}
                  </span>
                </div>

                {/* 3. Noise Anomaly Index */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    SYNTHETIC NOISE RISK
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {telemetry ? `${telemetry.noiseArtifactScore.toFixed(1)}%` : '--'}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full transition-all duration-500 ${
                        (telemetry?.noiseArtifactScore || 0) > 50
                          ? 'bg-purple-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${telemetry?.noiseArtifactScore || 0}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                    {(telemetry?.noiseArtifactScore || 0) > 50
                      ? 'Critical Artifacts'
                      : 'Normal Sensor'}
                  </span>
                </div>
              </div>

              {/* STEP-BY-STEP INSPECTION PIPELINE AUDIT */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Four-Step Inspection Pipeline Audit:
                </div>
                <div className="space-y-2">
                  {telemetry?.pipelineAudit.map((step) => {
                    const isPassed = step.status === 'PASSED';
                    const isFlagged = step.status === 'FLAGGED';
                    return (
                      <div
                        key={step.stepNumber}
                        className={`p-2.5 rounded-xl border text-xs transition-all ${
                          isPassed
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-800 dark:text-slate-200'
                            : isFlagged
                            ? 'bg-amber-500/5 border-amber-500/30 text-slate-800 dark:text-slate-200'
                            : 'bg-rose-500/5 border-rose-500/30 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isPassed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : isFlagged ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            )}
                            <span className="font-bold text-slate-900 dark:text-white">
                              Step {step.stepNumber}: {step.title}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono opacity-60">
                            {step.modelUsed}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 pl-5.5 leading-relaxed">
                          {step.details}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LIVE ACTION BUTTON: Push Approved Defect to Municipal Command Center */}
              {telemetry?.verdict === 'APPROVED' && onAddHazard && (
                <div className="pt-2">
                  <button
                    onClick={handleInjectToLiveQueue}
                    disabled={injectedToQueue}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                      injectedToQueue
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold shadow-emerald-500/20'
                    }`}
                  >
                    {injectedToQueue ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Incident Dispatched to Municipal GIS Grid!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Inject Verified Hazard into Live Municipal Command Center</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono text-[11px]">
            InfraPulse AI • Automated Dual-Pillar Civil Guardrail
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
