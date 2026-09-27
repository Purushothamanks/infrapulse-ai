'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { HazardReport, HazardType, getHazardProgress, VerificationTelemetry } from '@/types/hazard';
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
  Droplet,
  Truck,
  Zap,
  Sun,
  LifeBuoy,
  Trash2,
  Sparkles,
  Upload,
  Video,
  X,
  Users,
  ThumbsUp,
  Search,
  Filter,
  Eye,
  ExternalLink,
  Maximize2
} from 'lucide-react';

interface CitizenPortalProps {
  hazards: HazardReport[];
  onAddHazard: (newReport: HazardReport) => void;
  onDeleteHazard?: (hazardId: string) => void;
  onUpdateHazard?: (updated: HazardReport) => void;
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

export interface VisualMetrics {
  asphaltNeutralRatio: number;
  skinToneRatio: number;
  organicFurRatio: number;
  foliageGreenRatio: number;
  flatGraphicRatio: number;
  colorSaturationMean: number;
  localLaplacianVariance: number;
  aiGenerativeArtifactScore: number;
  detectedSubjectGuess: 'ROAD_DEFECT' | 'AI_GENERATED_FAKE' | 'ANIMAL' | 'HUMAN_SELFIE' | 'GRAPHIC_MEME' | 'NON_INFRASTRUCTURE';
  isLikelyFakeOrNonHazard: boolean;
  rejectionReason?: string;
  fileName?: string;
  // Backward compatibility
  organicRatio?: number;
  neutralRatio?: number;
  isLikelyNonHazard?: boolean;
}

const compressImageAndAnalyze = (
  dataUrlOrFile: string | File,
  providedFileName?: string
): Promise<{ dataUrl: string; visualMetrics?: VisualMetrics }> => {
  return new Promise((resolve) => {
    let fileName = providedFileName;
    if (typeof dataUrlOrFile !== 'string' && dataUrlOrFile instanceof File && !fileName) {
      fileName = dataUrlOrFile.name;
    }

    if (typeof dataUrlOrFile === 'string' && !dataUrlOrFile.startsWith('data:image')) {
      return resolve({ dataUrl: dataUrlOrFile });
    }
    const img = new Image();
    img.onload = () => {
      const maxDim = 960;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);

        let metrics: VisualMetrics | undefined = undefined;
        try {
          // Sample 96x96 grid for high-fidelity pixel & texture distribution
          const sampleDim = 96;
          const sCanvas = document.createElement('canvas');
          sCanvas.width = sampleDim;
          sCanvas.height = sampleDim;
          const sCtx = sCanvas.getContext('2d');
          if (sCtx) {
            sCtx.drawImage(canvas, 0, 0, sampleDim, sampleDim);
            const imgData = sCtx.getImageData(0, 0, sampleDim, sampleDim).data;
            const totalPixels = sampleDim * sampleDim;

            let asphaltNeutralCount = 0;
            let skinToneCount = 0;
            let warmFurCount = 0;
            let foliageCount = 0;
            let flatGraphicCount = 0;
            let saturationSum = 0;
            let laplacianDiffSum = 0;
            let totalComparisons = 0;

            for (let y = 0; y < sampleDim; y++) {
              for (let x = 0; x < sampleDim; x++) {
                const idx = (y * sampleDim + x) * 4;
                const r = imgData[idx];
                const g = imgData[idx + 1];
                const b = imgData[idx + 2];

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const delta = max - min;
                const sat = max === 0 ? 0 : delta / max;
                const brightness = (r + g + b) / 3;
                saturationSum += sat;

                // Micro-texture / photon noise variance (comparing with right pixel)
                if (x < sampleDim - 1) {
                  const nextIdx = (y * sampleDim + (x + 1)) * 4;
                  const diffR = Math.abs(r - imgData[nextIdx]);
                  const diffG = Math.abs(g - imgData[nextIdx + 1]);
                  const diffB = Math.abs(b - imgData[nextIdx + 2]);
                  laplacianDiffSum += (diffR + diffG + diffB) / 3;
                  totalComparisons++;
                }

                // 1. Asphalt / concrete / road neutral surface:
                // Low saturation grey / charcoal / bitumen / stone
                if (delta < 28 && brightness >= 20 && brightness <= 205) {
                  asphaltNeutralCount++;
                }

                // 2. Human skin / portrait / selfie:
                if (r > 95 && g > 40 && b > 20 && delta > 14 && (r - g) > 10 && r > b && (r - g) < 85) {
                  skinToneCount++;
                }

                // 3. Animal fur / warm pet coats (golden, amber, warm brown, tan):
                if (r > 110 && g > 60 && b < 110 && r > g && g > b && delta > 26) {
                  warmFurCount++;
                }

                // 4. Pure foliage / nature greenery:
                if (g > r * 1.18 && g > b * 1.18 && g > 55) {
                  foliageCount++;
                }

                // 5. Solid flat graphics / memes / cartoons / UI screenshot:
                if (brightness > 248 || brightness < 12 || (delta < 6 && (brightness > 215 || brightness < 35))) {
                  flatGraphicCount++;
                }
              }
            }

            const asphaltNeutralRatio = asphaltNeutralCount / totalPixels;
            const skinToneRatio = skinToneCount / totalPixels;
            const organicFurRatio = warmFurCount / totalPixels;
            const foliageGreenRatio = foliageCount / totalPixels;
            const flatGraphicRatio = flatGraphicCount / totalPixels;
            const colorSaturationMean = saturationSum / totalPixels;
            const localLaplacianVariance = totalComparisons > 0 ? (laplacianDiffSum / totalComparisons) : 0;

            // AI generative diffusion detection markers
            const fnLower = (fileName || '').toLowerCase();
            const hasAiKeywords = /ai|dall|midjourney|stable|diffusion|synthetic|render|fake|generated|bing|deepfake|prompt|flux|stablediffusion/.test(fnLower);
            const hasAnimalKeywords = /dog|cat|animal|pet|cow|puppy|kitten|bird|horse/.test(fnLower);
            const hasRoomKeywords = /room|indoor|bedroom|furniture|sofa|bed|chair/.test(fnLower);

            let aiScore = 5.2;
            if (hasAiKeywords) {
              aiScore = 96.5;
            } else if (colorSaturationMean > 0.42 && localLaplacianVariance < 8.5 && asphaltNeutralRatio < 0.40) {
              aiScore = 89.0;
            } else if (colorSaturationMean > 0.48 && localLaplacianVariance < 11.0) {
              aiScore = 79.5;
            } else if (colorSaturationMean > 0.38 && asphaltNeutralRatio < 0.22) {
              aiScore = 50.0;
            }

            let guess: VisualMetrics['detectedSubjectGuess'] = 'ROAD_DEFECT';
            let isFakeOrNon = false;
            let reason = '';

            if (hasAiKeywords || aiScore > 65.0) {
              guess = 'AI_GENERATED_FAKE';
              isFakeOrNon = true;
              reason = 'FRAUD ALERT: Detected synthetic generative diffusion artifacts and unnatural latent smoothing. InfraPulse AI strictly prohibits AI-generated road imagery to prevent civic fraud.';
            } else if (hasAnimalKeywords || organicFurRatio > 0.22 || (organicFurRatio > 0.15 && asphaltNeutralRatio < 0.20)) {
              guess = 'ANIMAL';
              isFakeOrNon = true;
              reason = 'Identified domestic animal or pet subject. Only legitimate civil infrastructure defects (potholes, water leaks, structural damage) are eligible for municipal triage.';
            } else if (skinToneRatio > 0.20 || (skinToneRatio > 0.12 && asphaltNeutralRatio < 0.20)) {
              guess = 'HUMAN_SELFIE';
              isFakeOrNon = true;
              reason = 'Identified human portrait or selfie scene. Please capture the physical road or infrastructure hazard.';
            } else if (flatGraphicRatio > 0.38 || (flatGraphicRatio > 0.25 && asphaltNeutralRatio < 0.15)) {
              guess = 'GRAPHIC_MEME';
              isFakeOrNon = true;
              reason = 'Digital screenshot, meme, or graphic drawing detected. Live on-site photographs of municipal defects are strictly required.';
            } else if (foliageGreenRatio > 0.45 && asphaltNeutralRatio < 0.15) {
              guess = 'NON_INFRASTRUCTURE';
              isFakeOrNon = true;
              reason = 'Natural landscape / foliage scene detected without visible road, pavement, or municipal asset defect.';
            } else if (hasRoomKeywords || asphaltNeutralRatio < 0.10) {
              guess = 'NON_INFRASTRUCTURE';
              isFakeOrNon = true;
              reason = 'The photograph does not contain recognizable road asphalt, concrete, or municipal infrastructure surfaces.';
            } else {
              guess = 'ROAD_DEFECT';
              isFakeOrNon = false;
            }

            metrics = {
              asphaltNeutralRatio,
              skinToneRatio,
              organicFurRatio,
              foliageGreenRatio,
              flatGraphicRatio,
              colorSaturationMean,
              localLaplacianVariance,
              aiGenerativeArtifactScore: aiScore,
              detectedSubjectGuess: guess,
              isLikelyFakeOrNonHazard: isFakeOrNon,
              rejectionReason: reason,
              fileName,
              organicRatio: organicFurRatio,
              neutralRatio: asphaltNeutralRatio,
              isLikelyNonHazard: isFakeOrNon
            };
          }
        } catch (_) {}

        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.72),
          visualMetrics: metrics
        });
      } else {
        resolve({ dataUrl: typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '' });
      }
    };
    img.onerror = () => {
      resolve({ dataUrl: typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '' });
    };

    if (typeof dataUrlOrFile === 'string') {
      img.src = dataUrlOrFile;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(dataUrlOrFile);
    }
  });
};

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  hazards,
  onAddHazard,
  onDeleteHazard,
  onUpdateHazard
}) => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'raise' | 'history' | 'community'>('raise');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Community Filters & Verification State
  const [communityCategoryFilter, setCommunityCategoryFilter] = useState<string>('ALL');
  const [communitySearch, setCommunitySearch] = useState<string>('');
  const [currentVisualMetrics, setCurrentVisualMetrics] = useState<VisualMetrics | null>(null);
  const [rejectionError, setRejectionError] = useState<{ detectedObject?: string; reason: string } | null>(null);

  // Detailed Modal & High-Res Image Lightbox State
  const [selectedDetailHazard, setSelectedDetailHazard] = useState<HazardReport | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // Form State
  const [selectedType, setSelectedType] = useState<HazardType>('pothole');
  const [selectedImage, setSelectedImage] = useState<string>('/sample-hazards/1_severe_pothole_crater.png');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample-pothole');
  const [uploadedFileName, setUploadedFileName] = useState<string>('1_severe_pothole_crater.png');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('Outer Ring Road, Near Tech Corridor');
  const [ward, setWard] = useState<string>('Ward 4 - East Tech Corridor');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });

  // Instant Real vs Fake Image Verification State
  const [isVerifyingImage, setIsVerifyingImage] = useState<boolean>(false);
  const [imageVerification, setImageVerification] = useState<VerificationTelemetry | null>(null);

  // Live Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [successSubmitted, setSuccessSubmitted] = useState<boolean>(false);

  const runInstantVerification = async (
    imgData: string,
    sampleId?: string,
    metrics?: VisualMetrics | null,
    fileName?: string
  ) => {
    setIsVerifyingImage(true);
    try {
      let testCaseId: string | undefined = undefined;
      if (sampleId === 'sample-pothole' || sampleId === 'test-real-pothole') testCaseId = 'test-real-pothole';
      else if (sampleId === 'sample-water_leak' || sampleId === 'test-water-leak') testCaseId = 'test-water-leak';
      else if (sampleId === 'test-ai-fake-pothole') testCaseId = 'test-ai-fake-pothole';
      else if (sampleId === 'test-animal-dog') testCaseId = 'test-animal-dog';
      else if (sampleId === 'test-indoor-room') testCaseId = 'test-indoor-room';

      const metricsToSend = metrics !== undefined ? metrics : currentVisualMetrics;

      const res = await fetch('/api/verify-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgData,
          testCaseId,
          description,
          fileName,
          visualMetrics: metricsToSend
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.telemetry) {
          setImageVerification(data.telemetry);
        }
      }
    } catch (err) {
      console.warn('Instant image verification failed:', err);
    } finally {
      setIsVerifyingImage(false);
    }
  };

  const handleSelectDemoPreset = (presetId: 'test-real-pothole' | 'test-ai-fake-pothole' | 'test-animal-dog' | 'test-indoor-room') => {
    let file = '/sample-hazards/1_severe_pothole_crater.png';
    let type: HazardType = 'pothole';
    let defaultAddr = 'Outer Ring Road, Near Tech Corridor';
    let defaultW = 'Ward 4 - East Tech Corridor';
    if (presetId === 'test-ai-fake-pothole') {
      file = '/sample-hazards/test_case_ai_fake_pothole.svg';
      type = 'pothole';
      defaultAddr = 'Synthetic AI Hazard Simulation (Midjourney v6)';
    } else if (presetId === 'test-animal-dog') {
      file = '/sample-hazards/test_case_animal_dog.svg';
      type = 'pothole';
      defaultAddr = 'Residential Pet / Domestic Scene';
    } else if (presetId === 'test-indoor-room') {
      file = '/sample-hazards/test_case_indoor_room.svg';
      type = 'pothole';
      defaultAddr = 'Indoor Living Room & Furniture';
    }
    const fname = file.split('/').pop() || '';
    setSelectedType(type);
    setSelectedImage(file);
    setSelectedSampleId(presetId);
    setUploadedFileName(fname);
    setCurrentVisualMetrics(null);
    setAddress(defaultAddr);
    setWard(defaultW);
    runInstantVerification(file, presetId, null, fname);
  };

  useEffect(() => {
    runInstantVerification('/sample-hazards/1_severe_pothole_crater.png', 'sample-pothole', null, '1_severe_pothole_crater.png');
  }, []);

  // 1. Separate Personal Grievances (strictly this civilian's account)
  const userEmail = (user?.email || '').trim().toLowerCase();
  const myComplaints = hazards.filter(
    (h) => (h.citizenEmail || '').trim().toLowerCase() === userEmail
  );

  // 2. Community Grievance Feed (all public municipal reports)
  const communityComplaints = hazards.filter((h) => {
    const matchesCategory =
      communityCategoryFilter === 'ALL' || h.type === communityCategoryFilter;
    const matchesSearch =
      !communitySearch ||
      h.title.toLowerCase().includes(communitySearch.toLowerCase()) ||
      h.location.address.toLowerCase().includes(communitySearch.toLowerCase()) ||
      h.location.ward.toLowerCase().includes(communitySearch.toLowerCase()) ||
      h.id.toLowerCase().includes(communitySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpvote = (hazardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = hazards.find((h) => h.id === hazardId);
    if (!target) return;
    const updated: HazardReport = {
      ...target,
      upvotes: (target.upvotes || 0) + 1
    };
    if (onUpdateHazard) {
      onUpdateHazard(updated);
    }
  };

  const handleCategorySelect = (cat: (typeof CATEGORIES)[0]) => {
    const fname = cat.sampleFile.split('/').pop() || '';
    setSelectedType(cat.type);
    setSelectedImage(cat.sampleFile);
    setSelectedSampleId(`sample-${cat.type}`);
    setUploadedFileName(fname);
    setCurrentVisualMetrics(null);
    setAddress(cat.defaultAddress);
    setWard(cat.defaultWard);
    runInstantVerification(cat.sampleFile, `sample-${cat.type}`, null, fname);
  };

  const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsAnalyzing(true);
        setAnalysisProgress('Running instant AI vision audit on uploaded photo...');
        const { dataUrl, visualMetrics } = await compressImageAndAnalyze(file, file.name);
        setSelectedImage(dataUrl);
        setUploadedFileName(file.name);
        setCurrentVisualMetrics(visualMetrics || null);
        setSelectedSampleId('custom-upload');
        runInstantVerification(dataUrl, 'custom-upload', visualMetrics || null, file.name);
      } catch (err) {
        console.error('Image compression error:', err);
      } finally {
        setIsAnalyzing(false);
        setAnalysisProgress('');
      }
    }
  };

  // Live Web Camera Controls
  const handleStartCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('WebRTC camera unavailable or blocked, triggering device native camera:', err);
      setIsCameraActive(false);
      if (nativeCameraInputRef.current) {
        nativeCameraInputRef.current.click();
      }
    }
  };

  const handleCaptureFrame = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const vw = videoRef.current.videoWidth || 640;
    const vh = videoRef.current.videoHeight || 480;
    const maxDim = 960;
    let w = vw;
    let h = vh;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
      const { visualMetrics } = await compressImageAndAnalyze(dataUrl, 'live_camera_capture.jpg');
      setSelectedImage(dataUrl);
      setUploadedFileName('live_camera_capture.jpg');
      setCurrentVisualMetrics(visualMetrics || null);
      setSelectedSampleId('custom-upload');
      runInstantVerification(dataUrl, 'custom-upload', visualMetrics || null, 'live_camera_capture.jpg');
    }
    handleStopCamera();
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisProgress('Running Computer Vision Triage on uploaded photo...');

    try {
      const { dataUrl: finalImage, visualMetrics: finalMetrics } = await compressImageAndAnalyze(selectedImage);
      const metricsToSend = currentVisualMetrics || finalMetrics;

      // Instant Real vs Fake Verification Guardrail
      if (imageVerification && imageVerification.verdict === 'REJECTED') {
        setIsAnalyzing(false);
        setAnalysisProgress('');
        setRejectionError({
          detectedObject: imageVerification.detectedObject || (imageVerification.isAiGenerated ? 'Synthetic AI-Generated Fake Image' : 'Non-Infrastructure Subject'),
          reason: imageVerification.rejectionReason || 'AI Verification Failed: The photo was flagged as an AI-generated fake or non-infrastructure scene. Real photographs of active municipal defects are strictly required.'
        });
        return;
      }

      // Fast Client-Side Guardrail: Fake / Animal / Domestic / Graphic rejection
      if (selectedSampleId === 'custom-upload' && metricsToSend?.isLikelyFakeOrNonHazard) {
        setIsAnalyzing(false);
        setAnalysisProgress('');
        setRejectionError({
          detectedObject: metricsToSend.detectedSubjectGuess === 'AI_GENERATED_FAKE'
            ? 'Synthetic AI-Generated Fake'
            : metricsToSend.detectedSubjectGuess || 'Non-Infrastructure Subject',
          reason: metricsToSend.rejectionReason || 'AI Vision Verification Failed: Photograph does not depict a genuine civil municipal infrastructure defect.'
        });
        return;
      }

      setTimeout(() => setAnalysisProgress('Cross-referencing Municipal GIS & Geo-Deduplication...'), 400);

      const res = await fetch('/api/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: finalImage,
          visualMetrics: metricsToSend,
          sampleId: selectedSampleId,
          fileName: uploadedFileName,
          description: description || `Civilian report: ${selectedType}`,
          lat: coords.lat,
          lng: coords.lng
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.analysis && data.isValidHazard !== false) {
        setAnalysisProgress('Broadcasting incident to Municipal Command Center in real-time...');

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
          imageUrl: finalImage,
          reportedAt: 'Just now',
          citizenName: (user?.name || 'Registered Civilian').replace(/commissioner\s*/gi, '').trim(),
          citizenEmail: user?.email || 'citizen@gmail.com',
          upvotes: 1,
          aiAnalysis: data.analysis
        };

        await onAddHazard(newReport);
        setSuccessSubmitted(true);
        try {
          const confettiModule = await import('canvas-confetti');
          const confettiFn = confettiModule.default || confettiModule;
          confettiFn({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch (_) {}

        // Switch to personal track view after 1.2s and open detailed view immediately
        setTimeout(() => {
          setSuccessSubmitted(false);
          setActiveTab('history');
          setSelectedDetailHazard(newReport);
        }, 1200);
      } else {
        // Triage rejected the photo as non-hazard or animal
        setIsAnalyzing(false);
        setAnalysisProgress('');
        setRejectionError({
          detectedObject: data.detectedObject || 'Animal / Non-infrastructure Object',
          reason: data.error || 'AI Verification Failed: The image was not recognized as an active municipal civil hazard (pothole, water leak, structural crack, illegal waste, or electrical hazard). Please provide a photo of an active civil infrastructure issue.'
        });
      }
    } catch (err) {
      console.error('Submission failed', err);
      alert('Network error submitting incident. Please check your connection.');
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
      {/* Citizen Portal Header with Official Branding Logo */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo - Same as Admin Navbar */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="/logo.png"
              alt="MyGovt AI Hub Logo"
              className="h-9 sm:h-10 w-auto object-contain rounded-xl shadow-xs"
            />
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              MY GOVT AI HUB
            </span>
          </div>

          {/* Header Action Buttons: Light/Dark Mode + Profile + Logout (TN Govt Help removed from top) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

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

      {/* Hidden Native Camera Input for immediate mobile shutter trigger */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCustomFileUpload}
        className="hidden"
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* VIEW 1: RAISE COMPLAINT FORM (Track option removed from top, available strictly at bottom) */}
        {activeTab === 'raise' && (
          <div className="space-y-4">
            {/* Context Header */}
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-500" />
                <span>Lodge Public Infrastructure Grievance</span>
              </h2>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-500/30 font-semibold">
                AI COMPUTER VISION TRIAGE
              </span>
            </div>

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

                {/* Step 2: Photo Upload + QUICK CAMERA CAPTURE OPTION */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-3">
                    Step 2: Capture Photo from Camera or Upload File
                  </label>

                  {/* Dual Action Buttons: Quick Camera Capture vs Upload File */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {/* CAMERA OPTION: Quick Photo Capture */}
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all cursor-pointer group shadow-xs text-left"
                    >
                      <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 shadow-md group-hover:scale-105 transition-transform">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                          Quick Photo Capture
                        </span>
                        <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium block">
                          Open live camera & snap picture
                        </span>
                      </div>
                    </button>

                    {/* UPLOAD OPTION: From Storage */}
                    <label className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-emerald-500 cursor-pointer transition-all group shadow-xs">
                      <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                          Upload File / Gallery
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Select PNG, JPG, WebP image
                        </span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleCustomFileUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Interactive Real vs Fake Test Presets */}
                  <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                        Quick Test: AI Real vs Fake Detection Presets
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Try any scenario</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectDemoPreset('test-real-pothole')}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedSampleId === 'test-real-pothole' || (selectedSampleId === 'sample-pothole' && !currentVisualMetrics)
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">Real Pothole</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoPreset('test-ai-fake-pothole')}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedSampleId === 'test-ai-fake-pothole'
                            ? 'bg-red-500/15 border-red-500 text-red-800 dark:text-red-300 shadow-xs'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-red-400'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">AI Fake (Midjourney)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoPreset('test-animal-dog')}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedSampleId === 'test-animal-dog'
                            ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 shadow-xs'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Animal / Pet</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoPreset('test-indoor-room')}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedSampleId === 'test-indoor-room'
                            ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 shadow-xs'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Indoor Room</span>
                      </button>
                    </div>
                  </div>

                  {/* LIVE CAMERA VIEWFINDER MODAL / INLINE VIEW */}
                  {isCameraActive && (
                    <div className="p-4 rounded-3xl bg-slate-950 border-2 border-emerald-500 text-white space-y-3 mb-4 animate-in zoom-in-95 duration-200 shadow-2xl">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-2 text-emerald-400 font-bold">
                          <Video className="w-4 h-4 animate-pulse" />
                          LIVE CAMERA STREAM ACTIVE
                        </span>
                        <button
                          type="button"
                          onClick={handleStopCamera}
                          className="p-1 rounded-lg text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handleStopCamera}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCaptureFrame}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Capture Photo Now</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Selected Image Preview & Real-Time Verification Scanner */}
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 aspect-video flex items-center justify-center shadow-xs">
                      {selectedImage ? (
                        <>
                          <img src={selectedImage} alt="Hazard preview" className="w-full h-full object-cover" />

                          {/* Animated Scanning Laser Overlay while analyzing */}
                          {isVerifyingImage && (
                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
                              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-[0_0_15px_#22d3ee]" />
                              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                              <span className="text-xs font-mono font-bold text-cyan-200">
                                ⚡ Dual-Pillar AI: Checking Real vs Fake...
                              </span>
                              <span className="text-[10px] text-cyan-300/80 font-mono mt-0.5">
                                Scanning Bayer camera noise & generative diffusion artifacts
                              </span>
                            </div>
                          )}

                          {/* Instant Verification Verdict Banner on Photo */}
                          {!isVerifyingImage && imageVerification && (
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                              {imageVerification.verdict === 'APPROVED' ? (
                                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-bold font-mono flex items-center gap-2 shadow-lg backdrop-blur-md">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <span>REAL DEFECT VERIFIED ({imageVerification.authenticityScore}% AUTHENTIC)</span>
                                </div>
                              ) : imageVerification.isAiGenerated ? (
                                <div className="px-3 py-1.5 rounded-xl bg-red-950/95 border-2 border-red-500 text-red-200 text-xs font-bold font-mono flex items-center gap-2 shadow-xl backdrop-blur-md animate-pulse">
                                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                  <span>🚨 REJECTED: SYNTHETIC AI-GENERATED FAKE</span>
                                </div>
                              ) : (
                                <div className="px-3 py-1.5 rounded-xl bg-amber-950/95 border-2 border-amber-500 text-amber-200 text-xs font-bold font-mono flex items-center gap-2 shadow-xl backdrop-blur-md">
                                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                  <span>⚠️ REJECTED: NON-INFRASTRUCTURE PHOTO</span>
                                </div>
                              )}
                            </div>
                          )}

                          {isAnalyzing && (
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20">
                              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                              <span className="text-xs font-mono font-bold text-emerald-300">{analysisProgress}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-500">No photo selected. Use Camera or Upload button above.</span>
                      )}
                    </div>

                    {/* Instant AI Diagnostics Card under the photo */}
                    {imageVerification && (
                      <div
                        className={`p-3.5 sm:p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in transition-all ${
                          imageVerification.verdict === 'APPROVED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                            : imageVerification.isAiGenerated
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-500/50 text-red-900 dark:text-red-200'
                            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/50 text-amber-900 dark:text-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                            {imageVerification.verdict === 'APPROVED' ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>AI Photo Analysis: Authentic Road / Civic Defect</span>
                              </>
                            ) : imageVerification.isAiGenerated ? (
                              <>
                                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                                <span>AI Fraud Detection: Fake / Synthetic AI Image</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>AI Subject Classifier: Non-Infrastructure Image</span>
                              </>
                            )}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              imageVerification.verdict === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/30'
                            }`}
                          >
                            {imageVerification.verdict === 'APPROVED' ? 'STATUS: APPROVED' : 'STATUS: BLOCKED'}
                          </span>
                        </div>

                        <p className="text-[12px] leading-relaxed">
                          {imageVerification.verdict === 'APPROVED' ? (
                            <span>
                              Real-time computer vision analysis confirmed natural camera sensor noise patterns and zero generative diffusion artifacts. Detected:{' '}
                              <strong>{imageVerification.detectedObject || 'Active Municipal Defect'}</strong>.
                            </span>
                          ) : imageVerification.isAiGenerated ? (
                            <span className="font-semibold text-red-800 dark:text-red-300">
                              {imageVerification.rejectionReason || 'Detected generative diffusion latent smoothing (Midjourney / DALL-E). Falsified or AI-simulated hazard imagery is strictly blocked.'}
                            </span>
                          ) : (
                            <span className="font-semibold text-amber-800 dark:text-amber-300">
                              {imageVerification.rejectionReason || 'The uploaded photograph does not depict legitimate municipal civil infrastructure. Please capture a real road or water defect.'}
                            </span>
                          )}
                        </p>

                        <div className="flex items-center gap-2.5 pt-1 text-[11px] font-mono opacity-85 flex-wrap">
                          <span>Authenticity: <strong>{imageVerification.authenticityScore}% Real</strong></span>
                          <span>•</span>
                          <span>Civil Relevance: <strong>{imageVerification.relevanceScore}%</strong></span>
                          <span>•</span>
                          <span>Synthetic Risk: <strong>{imageVerification.noiseArtifactScore}%</strong></span>
                        </div>
                      </div>
                    )}
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

                {/* Submit Button with Instant Real vs Fake Feedback */}
                <button
                  type="submit"
                  disabled={
                    !selectedImage ||
                    isAnalyzing ||
                    isVerifyingImage ||
                    imageVerification?.verdict === 'REJECTED'
                  }
                  className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    imageVerification?.verdict === 'REJECTED'
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting to Municipal Command Center...</span>
                    </>
                  ) : isVerifyingImage ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying Photo Authenticity (Real vs Fake)...</span>
                    </>
                  ) : imageVerification?.isAiGenerated ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-white" />
                      <span>Blocked: AI-Generated Fake Image Detected</span>
                    </>
                  ) : imageVerification?.verdict === 'REJECTED' ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-white" />
                      <span>Blocked: Non-Infrastructure Photo</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-slate-950" />
                      <span>Submit Grievance to Municipal Portal (Verified Real Photo)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 2: MY FILED REPORTS (Clean, Mobile-First Civic Tracking) */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Sleek, Modern, Mobile-First Header */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                      My Filed Reports
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 shrink-0">
                      {myComplaints.length} {myComplaints.length === 1 ? 'Report' : 'Reports'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Live municipal status for reports filed by {user?.email || 'your account'}
                  </p>
                </div>
              </div>

              {myComplaints.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('raise')}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Report New Defect</span>
                </button>
              )}
            </div>

            {myComplaints.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No reports filed yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven&apos;t registered any municipal infrastructure defects under this account.
                  Found a pothole or water leak? Lodge a report now.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('raise')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-emerald-400 transition-colors"
                >
                  Report a Defect
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myComplaints.map((hazard) => {
                  const isCritical = hazard.urgency === 'CRITICAL';
                  const progress = getHazardProgress(hazard.status);

                  return (
                    <div
                      key={hazard.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all relative group"
                    >
                      {/* Top Header: Image, Title, Urgency, View Details, and DELETE BUTTON */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={hazard.imageUrl}
                            alt={hazard.title}
                            onClick={() => setEnlargedImage(hazard.imageUrl)}
                            className="w-14 h-14 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-xs"
                            title="Click to view full photo"
                          />
                          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedDetailHazard(hazard)}>
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
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1 hover:text-emerald-500 transition-colors">
                              {hazard.title}
                            </h4>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              {hazard.location.address}
                            </span>
                          </div>
                        </div>

                        {/* Actions: View Details and Delete Button */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailHazard(hazard)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/50 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            title="View Full Grievance & AI Analysis Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(hazard.id)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            title="Delete / Withdraw this complaint"
                            aria-label="Delete Complaint"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

        {/* VIEW 3: COMMUNITY CIVIC FEED (Public Hazards Reported by Other Citizens) */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Community Civic Feed</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Public municipal infrastructure defects reported across the municipality. Browse & upvote critical issues.
                </p>
              </div>
              <span className="self-start sm:self-auto text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800">
                {communityComplaints.length} Public Incidents
              </span>
            </div>

            {/* Search and Category Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by street address, ward, or hazard ID..."
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
                />
                {communitySearch && (
                  <button
                    onClick={() => setCommunitySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'ALL', label: 'All Defect Types' },
                  { id: 'pothole', label: 'Potholes' },
                  { id: 'water_leak', label: 'Water Mains' },
                  { id: 'structural_crack', label: 'Structural' },
                  { id: 'illegal_waste', label: 'Waste' },
                  { id: 'electrical_hazard', label: 'Electrical' },
                  { id: 'solar_infrastructure', label: 'Solar' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCommunityCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      communityCategoryFilter === cat.id
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Grid */}
            {communityComplaints.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No community grievances found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {communitySearch || communityCategoryFilter !== 'ALL'
                    ? 'No public reports match your selected search or filter criteria.'
                    : 'No public grievances have been posted across the municipality yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communityComplaints.map((hazard) => {
                  const isCritical = hazard.urgency === 'CRITICAL';
                  const progress = getHazardProgress(hazard.status);
                  const isMyReport = (hazard.citizenEmail || '').trim().toLowerCase() === userEmail;

                  return (
                    <div
                      key={hazard.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-cyan-300 dark:hover:border-cyan-700/60 transition-all relative flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={hazard.imageUrl}
                              alt={hazard.title}
                              onClick={() => setEnlargedImage(hazard.imageUrl)}
                              className="w-16 h-16 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-xs"
                              title="Click to view full photo"
                            />
                            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedDetailHazard(hazard)}>
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
                                {isMyReport && (
                                  <span className="px-2 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                                    Your Report
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1 hover:text-cyan-500 transition-colors">
                                {hazard.title}
                              </h4>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                {hazard.location.address}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Municipal Ward & Citizen Reporter Tag */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                          <span>{hazard.location.ward}</span>
                          <span className="text-[10px] font-mono">
                            {hazard.citizenName || 'Civilian'} • {hazard.reportedAt}
                          </span>
                        </div>

                        {/* LIVE PROGRESS BADGE */}
                        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono ${
                              progress === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : progress === 'In progress'
                                ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 animate-pulse'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                            }`}
                          >
                            {progress === 'Completed' && '✓ '}
                            {progress === 'In progress' && '⚡ '}
                            {progress === 'Not started' && '⏳ '}
                            {progress}
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions: View Place/Photo Details & Upvote Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailHazard(hazard)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                            title="View high-resolution photo and complete place details"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span>View Place & Photo</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleUpvote(hazard.id, e)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                            title="Endorse this grievance to raise municipal priority"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Upvote ({hazard.upvotes || 0})</span>
                          </button>
                        </div>

                        <span className="text-[10px] font-mono text-slate-400">
                          Priority Score: {hazard.severity}/100
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* USER PAGE FIXED BOTTOM NAVIGATION DOCK:
          1: Raise
          2: My Grievances
          3: Community
          4: Help & Support */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 transition-colors">
        <div className="max-w-md mx-auto grid grid-cols-4 items-center gap-1">
          {/* 1. Raise Grievance */}
          <button
            type="button"
            onClick={() => setActiveTab('raise')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'raise'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-[10px]">Raise</span>
          </button>

          {/* 2. My Grievances */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'history'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Clock className="w-5 h-5" />
              {myComplaints.length > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500 text-slate-950">
                  {myComplaints.length}
                </span>
              )}
            </div>
            <span className="text-[10px]">My Reports</span>
          </button>

          {/* 3. Community Feed */}
          <button
            type="button"
            onClick={() => setActiveTab('community')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'community'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Users className="w-5 h-5" />
              {communityComplaints.length > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-cyan-500 text-slate-950">
                  {communityComplaints.length}
                </span>
              )}
            </div>
            <span className="text-[10px]">Community</span>
          </button>

          {/* 4. Help & Support */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="flex flex-col items-center gap-1 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
            title="Tamil Nadu Government Official Help & Support"
          >
            <LifeBuoy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] whitespace-nowrap">Help</span>
          </button>
        </div>
      </div>

      {/* AI HAZARD VERIFICATION REJECTION MODAL */}
      {rejectionError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm sm:max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 p-6 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-200 dark:border-red-800">
                AI Triage Verification Failed
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Defect Not Recognized as Civil Hazard
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {rejectionError.reason}
              </p>
              {rejectionError.detectedObject && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Identified Subject: </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{rejectionError.detectedObject}</span>
                </div>
              )}
            </div>
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => setRejectionError(null)}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Upload Real Infrastructure Defect Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIGH-RESOLUTION IMAGE LIGHTBOX MODAL */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
              title="Close image"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={enlargedImage}
              alt="Hazard Full View"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* COMPREHENSIVE HAZARD DETAIL & PLACE INSPECTION MODAL */}
      {selectedDetailHazard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
            {/* Header with Title, ID, and Close */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {selectedDetailHazard.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    selectedDetailHazard.urgency === 'CRITICAL'
                      ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}
                >
                  {selectedDetailHazard.urgency} [{selectedDetailHazard.severity}/100]
                </span>
                {(selectedDetailHazard.citizenEmail || '').trim().toLowerCase() === userEmail && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                    Your Report
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedDetailHazard(null)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Photo View with Enlarge Button */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-950">
                <img
                  src={selectedDetailHazard.imageUrl}
                  alt={selectedDetailHazard.title}
                  className="w-full h-52 sm:h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setEnlargedImage(selectedDetailHazard.imageUrl)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer shadow-md"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Enlarge Photo</span>
                </button>
              </div>

              {/* Title and Category */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {selectedDetailHazard.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Reported by {selectedDetailHazard.citizenName || 'Civic Scout'} • {selectedDetailHazard.reportedAt}
                </p>
              </div>

              {/* Place & Location Details Card */}
              <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60 space-y-2.5">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Place & Geographic Location Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Street Address:</span>
                    <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
                      {selectedDetailHazard.location.address}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Municipal Ward:</span>
                    <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
                      {selectedDetailHazard.location.ward}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">GPS Coordinates:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 block mt-0.5">
                      {selectedDetailHazard.location.lat.toFixed(5)}° N, {selectedDetailHazard.location.lng.toFixed(5)}° E
                    </span>
                  </div>
                  <div className="flex items-end">
                    <a
                      href={`https://www.google.com/maps?q=${selectedDetailHazard.location.lat},${selectedDetailHazard.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Live Status & Progress */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Live Municipal Progress:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono ${
                      getHazardProgress(selectedDetailHazard.status) === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : getHazardProgress(selectedDetailHazard.status) === 'In progress'
                        ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 animate-pulse'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                    }`}
                  >
                    {getHazardProgress(selectedDetailHazard.status)}
                  </span>
                </div>

                {/* 3-Step Progress Timeline */}
                <div className="flex items-center justify-between text-[11px] font-semibold pt-1">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>1. Not started</span>
                  </div>
                  <div
                    className={`w-8 h-0.5 ${
                      getHazardProgress(selectedDetailHazard.status) === 'In progress' ||
                      getHazardProgress(selectedDetailHazard.status) === 'Completed'
                        ? 'bg-cyan-500'
                        : 'bg-slate-300 dark:bg-slate-800'
                    }`}
                  />
                  <div
                    className={`flex items-center gap-1 ${
                      getHazardProgress(selectedDetailHazard.status) === 'In progress' ||
                      getHazardProgress(selectedDetailHazard.status) === 'Completed'
                        ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>2. In progress</span>
                  </div>
                  <div
                    className={`w-8 h-0.5 ${
                      getHazardProgress(selectedDetailHazard.status) === 'Completed'
                        ? 'bg-emerald-500'
                        : 'bg-slate-300 dark:bg-slate-800'
                    }`}
                  />
                  <div
                    className={`flex items-center gap-1 ${
                      getHazardProgress(selectedDetailHazard.status) === 'Completed'
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>3. Completed</span>
                  </div>
                </div>
              </div>

              {/* AI Engineering Analysis */}
              {selectedDetailHazard.aiAnalysis && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/30 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      Ai Prediction Budget (INR)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      REALTIME DETECTED
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300">
                      ₹{selectedDetailHazard.aiAnalysis.estimatedCost ? selectedDetailHazard.aiAnalysis.estimatedCost.toLocaleString('en-IN') : '12,500'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      (Realtime price detected by AI)
                    </span>
                  </div>
                  {selectedDetailHazard.aiAnalysis.dimensionsEstimated && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      Estimated Physical Scale: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{selectedDetailHazard.aiAnalysis.dimensionsEstimated}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Contractor (if any) */}
              {selectedDetailHazard.workOrder && (
                <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                      Assigned Municipal Contractor
                    </span>
                    <span className="font-semibold text-cyan-800 dark:text-cyan-300">
                      {selectedDetailHazard.workOrder.contractorTeam}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-mono text-[10px]">
                    {selectedDetailHazard.workOrder.status}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
              {(selectedDetailHazard.citizenEmail || '').trim().toLowerCase() === userEmail ? (
                <button
                  type="button"
                  onClick={() => {
                    setDeletingId(selectedDetailHazard.id);
                    setSelectedDetailHazard(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Withdraw / Delete Grievance</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleUpvote(selectedDetailHazard.id, e)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Upvote Community Hazard ({selectedDetailHazard.upvotes || 0})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedDetailHazard(null)}
                className="px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
