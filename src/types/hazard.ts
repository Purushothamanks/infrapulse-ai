export type HazardType =
  | 'pothole'
  | 'water_leak'
  | 'structural_crack'
  | 'illegal_waste'
  | 'electrical_hazard'
  | 'solar_infrastructure';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type HazardProgress = 'Not started' | 'In progress' | 'Completed';

export type HazardStatus =
  | 'DETECTED'
  | 'DISPATCHED'
  | 'IN_REPAIR'
  | 'RESOLVED'
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export function getHazardProgress(status: HazardStatus): HazardProgress {
  if (status === 'COMPLETED' || status === 'RESOLVED') return 'Completed';
  if (status === 'IN_PROGRESS' || status === 'IN_REPAIR' || status === 'DISPATCHED') return 'In progress';
  return 'Not started';
}

export function progressToStatus(progress: HazardProgress): HazardStatus {
  if (progress === 'Completed') return 'COMPLETED';
  if (progress === 'In progress') return 'IN_PROGRESS';
  return 'NOT_STARTED';
}

export interface LocationCoords {
  lat: number;
  lng: number;
  x: number; // For normalized SVG/Canvas city GIS projection (0-1000)
  y: number; // For normalized SVG/Canvas city GIS projection (0-1000)
  address: string;
  ward: string;
}

export interface AIAnalysisResult {
  confidence: number; // 0 - 100
  hazardType: HazardType;
  hazardLabel: string;
  detectedFeatures: string[];
  dimensionsEstimated: string;
  severityScore: number; // 0 - 100
  urgencyLevel: UrgencyLevel;
  sustainabilityImpact: string;
  suggestedAction: string;
  carbonPenaltyKgPerDay: number;
  estimatedCost: number; // in local currency (e.g. INR / USD)
  isDuplicate: boolean;
  duplicateClusterRef?: string;
}

export interface WorkOrder {
  orderId: string;
  contractorTeam: string;
  contactNumber: string;
  priorityLevel: UrgencyLevel;
  scheduledDispatch: string;
  estimatedRepairHours: number;
  requiredMaterials: string[];
  estimatedBudget: number;
  co2MitigationImpact: string;
  status: 'PENDING_APPROVAL' | 'DISPATCHED' | 'CREW_ON_SITE' | 'COMPLETED';
}

export interface HazardReport {
  id: string;
  title: string;
  type: HazardType;
  severity: number;
  urgency: UrgencyLevel;
  status: HazardStatus;
  location: LocationCoords;
  imageUrl: string;
  reportedAt: string;
  citizenName?: string;
  citizenEmail?: string;
  upvotes: number;
  aiAnalysis: AIAnalysisResult;
  workOrder?: WorkOrder;
}

export interface CityWardStat {
  wardId: string;
  name: string;
  openHazards: number;
  resolvedHazards: number;
  greenScore: number; // 0 - 100
  averageFixHours: number;
}
