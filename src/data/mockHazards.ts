import { HazardReport, CityWardStat } from '@/types/hazard';

export const initialHazards: HazardReport[] = [
  {
    id: 'HZ-2026-9041',
    title: 'Severe Arterial Road Crater',
    type: 'pothole',
    severity: 89,
    urgency: 'CRITICAL',
    status: 'DETECTED',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      x: 320,
      y: 280,
      address: 'Outer Ring Road, Near Tech Corridor Junction',
      ward: 'Ward 4 - East Tech Corridor'
    },
    imageUrl: '/sample-hazards/1_severe_pothole_crater.png',
    reportedAt: '12 mins ago',
    citizenName: 'Arjun Verma (Citizen Scout)',
    citizenEmail: 'purushothamank.s799@gmail.com',
    upvotes: 24,
    aiAnalysis: {
      confidence: 96.8,
      hazardType: 'pothole',
      hazardLabel: 'High-Velocity Road Crater (L3)',
      detectedFeatures: [
        'Asphalt sub-base erosion',
        'Radial rim cracking (> 45cm)',
        'Water pocket accumulation',
        'Vehicle axle damage risk'
      ],
      dimensionsEstimated: '1.4m diameter × 14.2cm depth',
      severityScore: 89,
      urgencyLevel: 'CRITICAL',
      sustainabilityImpact: 'Causes 18% fuel burn increase for idling commuter traffic; high accident risk for two-wheelers.',
      suggestedAction: 'Immediate hot-mix polymer bitumen patching and traffic diversion cones.',
      carbonPenaltyKgPerDay: 42.5,
      estimatedCost: 14500,
      isDuplicate: false
    },
    workOrder: {
      orderId: 'WO-BLR-8921',
      contractorTeam: 'City Rapid Asphalt Works Div-2',
      contactNumber: '+91 80 2297 5000',
      priorityLevel: 'CRITICAL',
      scheduledDispatch: 'Immediate (T-45 mins)',
      estimatedRepairHours: 3.5,
      requiredMaterials: ['Polymer Cold Asphalt 300kg', 'Bitumen Emulsion RS-1', 'Road Warning Barricades'],
      estimatedBudget: 14500,
      co2MitigationImpact: 'Mitigates 42.5 kg CO2/day in traffic congestion & prevents tire shredding',
      status: 'DISPATCHED'
    }
  },
  {
    id: 'HZ-2026-9042',
    title: 'High-Pressure Water Main Rupture',
    type: 'water_leak',
    severity: 94,
    urgency: 'CRITICAL',
    status: 'IN_REPAIR',
    location: {
      lat: 12.9352,
      lng: 77.6245,
      x: 610,
      y: 420,
      address: '80 Feet Road, 4th Block Urban Sector',
      ward: 'Ward 7 - South Central'
    },
    imageUrl: '/sample-hazards/2_water_main_rupture.png',
    reportedAt: '35 mins ago',
    citizenName: 'Priya Sundaram',
    citizenEmail: 'purushothamank.s799@gmail.com',
    upvotes: 41,
    aiAnalysis: {
      confidence: 98.2,
      hazardType: 'water_leak',
      hazardLabel: 'Arterial Potable Pipeline Burst',
      detectedFeatures: [
        'Pressurized geyser flow detected',
        'Sub-surface soil liquefaction risk',
        'Roadway inundation > 250 sq. meters'
      ],
      dimensionsEstimated: 'Estimated discharge rate: ~450 Liters/min',
      severityScore: 94,
      urgencyLevel: 'CRITICAL',
      sustainabilityImpact: 'Potable water loss critical; potential sub-base road collapse and underground utility flooding.',
      suggestedAction: 'Remotely trigger SCADA valve shutoff on Sector 7 trunk line; deploy hydro-excavation team.',
      carbonPenaltyKgPerDay: 88.0,
      estimatedCost: 48000,
      isDuplicate: false
    },
    workOrder: {
      orderId: 'WO-BLR-8922',
      contractorTeam: 'Municipal Hydro Utilities Emergency Unit',
      contactNumber: '+91 80 2297 5210',
      priorityLevel: 'CRITICAL',
      scheduledDispatch: 'En Route',
      estimatedRepairHours: 6.0,
      requiredMaterials: ['DI Pipe Collar 300mm', 'Sluice Valve Seal Kit', 'Sump Pump 15HP'],
      estimatedBudget: 48000,
      co2MitigationImpact: 'Saves 27,000 Liters of treated potable water per hour',
      status: 'CREW_ON_SITE'
    }
  },
  {
    id: 'HZ-2026-9043',
    title: 'Flyover Structural Pillar Fissure',
    type: 'structural_crack',
    severity: 86,
    urgency: 'HIGH',
    status: 'DETECTED',
    location: {
      lat: 12.9856,
      lng: 77.5367,
      x: 210,
      y: 560,
      address: 'Pillar #42, Metro-Elevated Expressway',
      ward: 'Ward 2 - West Industrial'
    },
    imageUrl: '/sample-hazards/3_structural_flyover_crack.png',
    reportedAt: '2 hours ago',
    citizenName: 'Infra Drone Telemetry Unit 04',
    citizenEmail: 'purushothamank.s799@gmail.com',
    upvotes: 56,
    aiAnalysis: {
      confidence: 94.1,
      hazardType: 'structural_crack',
      hazardLabel: 'Diagonal Shear Fissure on Concrete Stanchion',
      detectedFeatures: [
        'Diagonal shear vector',
        'Micro-spalling along crack perimeter',
        'Rebar exposure risk',
        'Structural vibration amplification'
      ],
      dimensionsEstimated: '2.8m length, 4.2mm aperture width',
      severityScore: 86,
      urgencyLevel: 'HIGH',
      sustainabilityImpact: 'Long-term structural compromise; failure to repair early increases remediation cost tenfold.',
      suggestedAction: 'Conduct ultrasonic non-destructive testing (NDT) followed by carbon fiber reinforced polymer (CFRP) wrapping.',
      carbonPenaltyKgPerDay: 15.0,
      estimatedCost: 85000,
      isDuplicate: false
    }
  },
  {
    id: 'HZ-2026-9044',
    title: 'Unauthorized Bio-Waste Dumping',
    type: 'illegal_waste',
    severity: 78,
    urgency: 'HIGH',
    status: 'DETECTED',
    location: {
      lat: 13.0358,
      lng: 77.5970,
      x: 740,
      y: 190,
      address: 'Lakeside Greenway Buffer Zone',
      ward: 'Ward 9 - North Ecological Reserve'
    },
    imageUrl: '/sample-hazards/4_illegal_waste_dump.png',
    reportedAt: '3 hours ago',
    citizenName: 'Greenpeace Lake Watcher',
    citizenEmail: 'purushothamank.s799@gmail.com',
    upvotes: 19,
    aiAnalysis: {
      confidence: 97.5,
      hazardType: 'illegal_waste',
      hazardLabel: 'Mixed Solid & Chemical Waste Heap',
      detectedFeatures: [
        'High density plastics & chemical drums',
        'Proximity to storm drainage (14m)',
        'Groundwater contamination threat',
        'SDG 11 & SDG 14 violation'
      ],
      dimensionsEstimated: 'Approx 4.2 tons over 60 sq. meters',
      severityScore: 78,
      urgencyLevel: 'HIGH',
      sustainabilityImpact: 'High risk of toxic leachate seeping into municipal aquifer; greenhouse gas methane release.',
      suggestedAction: 'Dispatch mechanical grabber truck; log GPS geo-hash for municipal environmental penalty enforcement.',
      carbonPenaltyKgPerDay: 120.4,
      estimatedCost: 22000,
      isDuplicate: false
    }
  },
  {
    id: 'HZ-2026-9045',
    title: 'Smart Streetlight High-Voltage Arc',
    type: 'electrical_hazard',
    severity: 92,
    urgency: 'CRITICAL',
    status: 'DISPATCHED',
    location: {
      lat: 12.9279,
      lng: 77.6271,
      x: 520,
      y: 690,
      address: 'Pedestrian Crosswalk, School Zone 12',
      ward: 'Ward 5 - South Hub'
    },
    imageUrl: '/sample-hazards/5_broken_smart_streetlight.png',
    reportedAt: '25 mins ago',
    citizenName: 'Kavita Menon',
    citizenEmail: 'purushothamank.s799@gmail.com',
    upvotes: 38,
    aiAnalysis: {
      confidence: 99.1,
      hazardType: 'electrical_hazard',
      hazardLabel: 'Dangling Fixture with Exposed 230V Wiring',
      detectedFeatures: [
        'Shattered Luminaire casing',
        'Unshielded primary conductor dangling at 2.1m',
        'High pedestrian hazard density'
      ],
      dimensionsEstimated: 'Pendant cable drop: 1.8m from junction',
      severityScore: 92,
      urgencyLevel: 'CRITICAL',
      sustainabilityImpact: 'Severe electrocution threat near school zone; continuous power leakage of 1.2 kW.',
      suggestedAction: 'Trip Ward 5 Pole-18 circuit breaker immediately; replace luminaire bracket.',
      carbonPenaltyKgPerDay: 18.2,
      estimatedCost: 8500,
      isDuplicate: false
    },
    workOrder: {
      orderId: 'WO-BLR-8924',
      contractorTeam: 'Smart Lighting Grid Response Unit',
      contactNumber: '+91 80 2297 5340',
      priorityLevel: 'CRITICAL',
      scheduledDispatch: 'En Route',
      estimatedRepairHours: 1.5,
      requiredMaterials: ['LED Luminaire 90W', 'Arm Mount Bracket', 'Surge Protector 10kV'],
      estimatedBudget: 8500,
      co2MitigationImpact: 'Restores energy efficient LED illumination & removes fatal shock hazard',
      status: 'DISPATCHED'
    }
  },
  {
    id: 'HZ-2026-9046',
    title: 'Civic Rooftop Solar Array Fracture',
    type: 'solar_infrastructure',
    severity: 65,
    urgency: 'MODERATE',
    status: 'DETECTED',
    location: {
      lat: 12.9991,
      lng: 77.6710,
      x: 820,
      y: 350,
      address: 'Community Center & Micro-Grid Station',
      ward: 'Ward 11 - East Suburbs'
    },
    imageUrl: '/sample-hazards/6_solar_grid_damage.png',
    reportedAt: '5 hours ago',
    citizenName: 'Solar Grid SCADA Telemetry',
    citizenEmail: 'purushothamank.s799@gmail.com',
    upvotes: 8,
    aiAnalysis: {
      confidence: 93.4,
      hazardType: 'solar_infrastructure',
      hazardLabel: 'Micro-Inverter String Failure & Cell Delamination',
      detectedFeatures: [
        'Photovoltaic surface micro-cracking',
        'Localized thermal hotspot (> 72°C)',
        'String generation drop (-28%)'
      ],
      dimensionsEstimated: '2 damaged modules (540W monocrystalline)',
      severityScore: 65,
      urgencyLevel: 'MODERATE',
      sustainabilityImpact: 'Loss of 4.8 kWh daily clean solar energy; increases grid dependency on thermal power.',
      suggestedAction: 'Bypass affected panel string to protect inverter; schedule replacement during off-peak morning hours.',
      carbonPenaltyKgPerDay: 3.9,
      estimatedCost: 19000,
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
