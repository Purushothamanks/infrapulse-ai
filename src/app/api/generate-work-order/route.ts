import { NextResponse } from 'next/server';
import { WorkOrder, UrgencyLevel } from '@/types/hazard';

export async function POST(request: Request) {
  try {
    const { hazardId, hazardType, severity, ward, address } = await request.json();

    // Map contractors based on hazard type
    const contractors = {
      pothole: { name: 'City Rapid Pavement Logistics Div-2', phone: '+91 80 2297 5000' },
      water_leak: { name: 'Municipal Hydro Utilities Emergency Unit', phone: '+91 80 2297 5210' },
      structural_crack: { name: 'Urban Bridge & Heavy Infrastructure Bureau', phone: '+91 80 2297 5440' },
      illegal_waste: { name: 'GreenCity Bio-Hazard & Solid Waste Fleet', phone: '+91 80 2297 5880' },
      electrical_hazard: { name: 'Smart Power Grid Emergency Team', phone: '+91 80 2297 5340' },
      solar_infrastructure: { name: 'Renewable Micro-Grid Maintenance Cell', phone: '+91 80 2297 5600' }
    };

    const contractor = contractors[hazardType as keyof typeof contractors] || contractors.pothole;
    const priorityLevel: UrgencyLevel = severity >= 85 ? 'CRITICAL' : severity >= 65 ? 'HIGH' : 'MODERATE';

    const materialsMap: Record<string, string[]> = {
      pothole: ['Polymer Cold Asphalt 300kg', 'Bitumen Emulsion RS-1', 'Road Warning Barricades'],
      water_leak: ['DI Pipe Collar 300mm', 'Sluice Valve Seal Kit', 'Sump Pump 15HP'],
      structural_crack: ['Structural Epoxy Grout', 'Carbon Fiber CFRP Laminates', 'Pore Pressure Sensors'],
      illegal_waste: ['Bio-Degradable Waste Enclosures', 'High-Capacity Loader Trux', 'Lime Disinfectant Spray'],
      electrical_hazard: ['LED Luminaire 90W', 'Arm Mount Bracket', 'Surge Protector 10kV'],
      solar_infrastructure: ['Bifacial Solar Module 540W', 'MC4 Inline Connectors', 'DC Breaker 1000V']
    };

    const workOrder: WorkOrder = {
      orderId: `WO-MUN-${Math.floor(1000 + Math.random() * 9000)}`,
      contractorTeam: contractor.name,
      contactNumber: contractor.phone,
      priorityLevel,
      scheduledDispatch: severity >= 85 ? 'IMMEDIATE DISPATCH (T-30 MINS)' : 'SCHEDULED (NEXT MORNING SHIFT)',
      estimatedRepairHours: parseFloat((severity / 16).toFixed(1)),
      requiredMaterials: materialsMap[hazardType] || ['Standard Civil Maintenance Kit', 'Safety Bollards'],
      estimatedBudget: Math.round((severity * 280) + 5000),
      co2MitigationImpact: `Mitigates ${Math.round(severity * 0.85)} kg CO2 equivalent and prevents civic disruption in ${ward || 'Metropolitan Ward'}.`,
      status: 'DISPATCHED'
    };

    return NextResponse.json({ success: true, workOrder });
  } catch (error) {
    console.error('Error in work-order API:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate work order' }, { status: 500 });
  }
}
