import { HazardReport, CityWardStat } from '@/types/hazard';

export const initialHazards: HazardReport[] = [
  {
    id: 'HZ-2026-9214',
    title: 'Severe Road Crater & Sub-Base Cavitation',
    type: 'pothole',
    severity: 88,
    urgency: 'CRITICAL',
    status: 'IN_PROGRESS',
    location: {
      lat: 12.9716,
      lng: 80.2452,
      x: 480,
      y: 350,
      address: 'Outer Ring Road, Near Tech Corridor',
      ward: 'Ward 4 - East Tech Corridor'
    },
    imageUrl: '/sample-hazards/1_severe_pothole_crater.png',
    reportedAt: '12 mins ago',
    citizenName: 'Arjun Verma',
    citizenEmail: 'arjun.verma@gmail.com',
    upvotes: 7,
    aiAnalysis: {
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
      sustainabilityImpact: 'Increases local vehicle emissions by 22% due to stop-and-go braking; accident hazard.',
      suggestedAction: 'Immediate fast-curing polymer asphalt infill; place LED beacon warning signs.',
      carbonPenaltyKgPerDay: 38.6,
      estimatedCost: 12500,
      isDuplicate: false
    },
    workOrder: {
      orderId: 'WO-MUN-8419',
      contractorTeam: 'City Rapid Pavement Logistics Div-2',
      contactNumber: '+91 80 2297 5000',
      priorityLevel: 'CRITICAL',
      scheduledDispatch: 'IMMEDIATE DISPATCH (T-30 MINS)',
      estimatedRepairHours: 5.5,
      requiredMaterials: ['Polymer Cold Asphalt 300kg', 'Bitumen Emulsion RS-1', 'Road Warning Barricades'],
      estimatedBudget: 29640,
      co2MitigationImpact: 'Mitigates 75 kg CO2 equivalent and prevents civic disruption.',
      status: 'DISPATCHED'
    }
  },
  {
    id: 'HZ-2026-9302',
    title: 'Municipal Pressurized Water Pipe Rupture',
    type: 'water_leak',
    severity: 95,
    urgency: 'CRITICAL',
    status: 'NOT_STARTED',
    location: {
      lat: 12.9832,
      lng: 80.2315,
      x: 520,
      y: 420,
      address: '80 Feet Road, 4th Block Urban Sector',
      ward: 'Ward 7 - South Central'
    },
    imageUrl: '/sample-hazards/2_water_main_rupture.png',
    reportedAt: '25 mins ago',
    citizenName: 'Civilian Citizen',
    citizenEmail: 'citizen@gmail.com',
    upvotes: 12,
    aiAnalysis: {
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
    }
  },
  {
    id: 'HZ-2026-9188',
    title: 'Reinforced Concrete Structural Shear Crack',
    type: 'structural_crack',
    severity: 84,
    urgency: 'HIGH',
    status: 'NOT_STARTED',
    location: {
      lat: 12.9645,
      lng: 80.2189,
      x: 430,
      y: 490,
      address: 'Pillar #42, Metro Expressway',
      ward: 'Ward 2 - West Industrial'
    },
    imageUrl: '/sample-hazards/3_structural_flyover_crack.png',
    reportedAt: '1 hour ago',
    citizenName: 'Arjun Verma',
    citizenEmail: 'arjun.verma@gmail.com',
    upvotes: 4,
    aiAnalysis: {
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
    }
  },
  {
    id: 'HZ-2026-9055',
    title: 'Unregulated Municipal Waste & Chemical Heap',
    type: 'illegal_waste',
    severity: 76,
    urgency: 'HIGH',
    status: 'NOT_STARTED',
    location: {
      lat: 12.9912,
      lng: 80.2541,
      x: 580,
      y: 310,
      address: 'Lakeside Greenway Buffer Zone',
      ward: 'Ward 9 - North Ecological Reserve'
    },
    imageUrl: '/sample-hazards/4_illegal_waste_dump.png',
    reportedAt: '2 hours ago',
    citizenName: 'Civilian Citizen',
    citizenEmail: 'citizen@gmail.com',
    upvotes: 9,
    aiAnalysis: {
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
      sustainabilityImpact: 'Violation of UN SDG 11.6; high soil contamination threat.',
      suggestedAction: 'Dispatch municipal heavy compactor loader; report GPS coordinate.',
      carbonPenaltyKgPerDay: 110.0,
      estimatedCost: 18500,
      isDuplicate: false
    }
  }
];

export const cityWardStats: CityWardStat[] = [
  { wardId: 'W-04', name: 'East Tech Corridor', openHazards: 14, resolvedHazards: 48, greenScore: 78, averageFixHours: 4.2 },
  { wardId: 'W-07', name: 'South Central', openHazards: 8, resolvedHazards: 62, greenScore: 84, averageFixHours: 3.1 },
  { wardId: 'W-02', name: 'West Industrial', openHazards: 22, resolvedHazards: 35, greenScore: 61, averageFixHours: 7.8 },
  { wardId: 'W-09', name: 'North Ecological Reserve', openHazards: 5, resolvedHazards: 51, greenScore: 92, averageFixHours: 2.8 },
  { wardId: 'W-05', name: 'South Hub', openHazards: 11, resolvedHazards: 43, greenScore: 73, averageFixHours: 4.9 },
  { wardId: 'W-11', name: 'East Suburbs', openHazards: 7, resolvedHazards: 39, greenScore: 81, averageFixHours: 5.5 }
];
