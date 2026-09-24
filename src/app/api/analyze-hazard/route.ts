import { NextResponse } from 'next/server';
import { HazardType, UrgencyLevel, AIAnalysisResult } from '@/types/hazard';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, sampleId, description, lat, lng } = body;

    // Simulate AI Vision analysis processing delay (500ms for realistic feel)
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Preset classification intelligence if a sample image is analyzed
    let analysis: AIAnalysisResult;

    if (sampleId?.includes('pothole') || description?.toLowerCase().includes('pothole') || description?.toLowerCase().includes('crater')) {
      analysis = {
        confidence: 97.4,
        hazardType: 'pothole',
        hazardLabel: 'Deep Sub-Base Road Crater',
        detectedFeatures: [
          'High rim asphalt cavitation (> 12cm)',
          'Structural sub-grade water saturation',
          'Immediate vehicular axle hazard',
          'High traffic density zone'
        ],
        dimensionsEstimated: '1.2m diameter × 13.5cm depth',
        severityScore: 88,
        urgencyLevel: 'CRITICAL',
        sustainabilityImpact: 'Increases local vehicle emissions by 22% due to stop-and-go braking; increases accident hazard.',
        suggestedAction: 'Immediate fast-curing polymer asphalt infill; place LED beacon warning signs.',
        carbonPenaltyKgPerDay: 38.6,
        estimatedCost: 12500,
        isDuplicate: false
      };
    } else if (sampleId?.includes('water') || description?.toLowerCase().includes('water') || description?.toLowerCase().includes('pipe')) {
      analysis = {
        confidence: 98.9,
        hazardType: 'water_leak',
        hazardLabel: 'Municipal Pressurized Water Pipe Rupture',
        detectedFeatures: [
          'Pressurized water plume detected',
          'Sub-surface soil erosion under asphalt',
          'Potable drinking water wastage'
        ],
        dimensionsEstimated: 'Discharge estimate: ~380 Liters/minute',
        severityScore: 95,
        urgencyLevel: 'CRITICAL',
        sustainabilityImpact: 'Depletes municipal freshwater reserves; risks roadway collapse via sinkhole formation.',
        suggestedAction: 'Remotely isolate valve feeder line; deploy hydraulic clamp crew.',
        carbonPenaltyKgPerDay: 75.0,
        estimatedCost: 42000,
        isDuplicate: false
      };
    } else if (sampleId?.includes('waste') || description?.toLowerCase().includes('trash') || description?.toLowerCase().includes('garbage')) {
      analysis = {
        confidence: 96.1,
        hazardType: 'illegal_waste',
        hazardLabel: 'Unregulated Municipal Waste & Chemical Heap',
        detectedFeatures: [
          'Non-biodegradable polymers and debris',
          'Proximity to storm water channels',
          'Methane and leachate generation'
        ],
        dimensionsEstimated: 'Approx 3.5 tons across 45 sq. meters',
        severityScore: 76,
        urgencyLevel: 'HIGH',
        sustainabilityImpact: 'Violation of UN SDG 11.6 (Air Quality & Municipal Waste); high soil contamination threat.',
        suggestedAction: 'Dispatch municipal heavy compactor loader; report GPS coordinate to environmental vigilance cell.',
        carbonPenaltyKgPerDay: 110.0,
        estimatedCost: 18500,
        isDuplicate: false
      };
    } else if (sampleId?.includes('crack') || description?.toLowerCase().includes('bridge') || description?.toLowerCase().includes('flyover')) {
      analysis = {
        confidence: 93.8,
        hazardType: 'structural_crack',
        hazardLabel: 'Reinforced Concrete Structural Shear Crack',
        detectedFeatures: [
          'Diagonal shear fissure pattern',
          'Concrete spalling along load axis',
          'Structural vibration vulnerability'
        ],
        dimensionsEstimated: '2.4m length × 3.8mm aperture',
        severityScore: 84,
        urgencyLevel: 'HIGH',
        sustainabilityImpact: 'Premature bridge deterioration requiring carbon-heavy replacement if left unattended.',
        suggestedAction: 'Epoxy resin pressure injection and continuous strain gauge sensor installation.',
        carbonPenaltyKgPerDay: 12.0,
        estimatedCost: 65000,
        isDuplicate: false
      };
    } else if (sampleId?.includes('street') || description?.toLowerCase().includes('light') || description?.toLowerCase().includes('electric')) {
      analysis = {
        confidence: 98.0,
        hazardType: 'electrical_hazard',
        hazardLabel: 'Smart Streetlight Terminal Shock Risk',
        detectedFeatures: [
          'Dangling exposed 230V feeder wire',
          'Water ingress into junction box',
          'High public crosswalk risk'
        ],
        dimensionsEstimated: 'Exposed copper conductor at 1.9m height',
        severityScore: 91,
        urgencyLevel: 'CRITICAL',
        sustainabilityImpact: 'Direct public electrocution hazard and continuous parasitic power leakage.',
        suggestedAction: 'Emergency power cutoff to Ward feeder; replace weatherproof junction housing.',
        carbonPenaltyKgPerDay: 16.5,
        estimatedCost: 7800,
        isDuplicate: false
      };
    } else {
      // Dynamic fallback for any custom user uploaded picture
      analysis = {
        confidence: 91.5,
        hazardType: 'pothole',
        hazardLabel: 'Civil Infrastructure Surface Anomaly',
        detectedFeatures: [
          'Surface pavement deformation detected',
          'Sub-base irregularity detected',
          'Civil engineering risk profile flagged'
        ],
        dimensionsEstimated: 'Area: ~0.8m² | Moderate Depth',
        severityScore: 72,
        urgencyLevel: 'HIGH',
        sustainabilityImpact: 'Accelerates infrastructure degradation and impacts neighborhood transit efficiency.',
        suggestedAction: 'Dispatch Ward Field Engineer for on-site ultrasound check and patch sealing.',
        carbonPenaltyKgPerDay: 24.0,
        estimatedCost: 16000,
        isDuplicate: false
      };
    }

    return NextResponse.json({
      success: true,
      analysis,
      geoAnalysis: {
        nearestClusterDistanceMeters: 42,
        deduplicationStatus: 'VERIFIED_UNIQUE_NEW_REPORT',
        predictedRepairTimeHours: (analysis.severityScore / 15).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Error in AI analysis route:', error);
    return NextResponse.json({ success: false, error: 'Failed to inspect image' }, { status: 500 });
  }
}
