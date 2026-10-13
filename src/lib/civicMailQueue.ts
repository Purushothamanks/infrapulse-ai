import { supabase } from '@/lib/supabase';
import { HazardReport, WorkOrder, getHazardProgress } from '@/types/hazard';

const ADMIN_EMAIL = 'mygovtaihub@gmail.com';

function getFormattedDate(): string {
  try {
    return new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (_) {
    return new Date().toLocaleString();
  }
}

/**
 * 1. Immediate Alert to Municipal Admin when any citizen submits a hazard
 */
export async function sendAdminNewHazardAlert(hazard: HazardReport): Promise<boolean> {
  try {
    const timestamp = getFormattedDate();
    const cleanCitizen = (hazard.citizenName || 'Civic Scout').trim();
    const citizenEmail = (hazard.citizenEmail || 'citizen@mygovthub.web.app').trim();

    const subject = `🚨 URGENT: New Civic Hazard Reported - ${hazard.title} (${hazard.location.ward})`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px 12px; color: #f8fafc; }
    .card { max-width: 620px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase; }
    .header p { margin: 4px 0 0 0; font-size: 12px; color: #d1fae5; font-mono; }
    .body { padding: 24px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; font-family: monospace; }
    .badge-critical { background-color: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid #ef4444; }
    .badge-approved { background-color: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid #10b981; }
    .detail-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .detail-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #334155; }
    .detail-table td.label { color: #94a3b8; font-weight: 600; width: 35%; }
    .detail-table td.val { color: #f1f5f9; font-weight: 700; }
    .cta-btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: #022c22; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 12px; text-align: center; margin-top: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { text-align: center; font-size: 11px; color: #64748b; padding: 18px 24px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size: 28px; margin-bottom: 6px;">🏛️</div>
      <h1>Government of Tamil Nadu • Municipal Command Center</h1>
      <p>NEW CIVIC HAZARD INCIDENT ALERT • ${hazard.id}</p>
    </div>
    <div class="body">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span class="badge badge-critical">SEVERITY: ${hazard.severity}/100 • ${hazard.urgency}</span>
        <span class="badge badge-approved">AI VERIFIED REAL DEFECT</span>
      </div>

      <h2 style="font-size: 17px; margin: 0 0 8px 0; color: #ffffff;">${hazard.title}</h2>
      <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px 0;">
        A new civil infrastructure defect has been submitted by a citizen and authenticated by the vision triage pipeline.
      </p>

      <table class="detail-table">
        <tr>
          <td class="label">Incident Ref</td>
          <td class="val" style="font-family: monospace; color: #34d399;">${hazard.id}</td>
        </tr>
        <tr>
          <td class="label">Hazard Type</td>
          <td class="val">${hazard.type.toUpperCase().replace('_', ' ')}</td>
        </tr>
        <tr>
          <td class="label">Location &amp; Ward</td>
          <td class="val">${hazard.location.address}<br/><span style="color: #38bdf8; font-size: 12px;">${hazard.location.ward}</span></td>
        </tr>
        <tr>
          <td class="label">GPS Coordinates</td>
          <td class="val" style="font-family: monospace;">${hazard.location.lat.toFixed(5)}, ${hazard.location.lng.toFixed(5)}</td>
        </tr>
        <tr>
          <td class="label">Reporting Citizen</td>
          <td class="val">${cleanCitizen} (${citizenEmail})</td>
        </tr>
        <tr>
          <td class="label">Estimated Remediation</td>
          <td class="val" style="color: #a78bfa;">₹${(hazard.aiAnalysis?.estimatedCost || 12500).toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td class="label">Logged At</td>
          <td class="val">${timestamp}</td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://mygovthub.web.app/" class="cta-btn">Inspect Incident &amp; Issue Work Order →</a>
      </div>
    </div>
    <div class="footer">
      Autonomous Urban Infrastructure Triage &amp; Sustainable Action Bureau<br/>
      Tamil Nadu Municipal Administration • Ezhilagam Complex, Chepauk, Chennai
    </div>
  </div>
</body>
</html>
`;

    const text = `🚨 URGENT: New Civic Hazard Reported
Incident: ${hazard.title} (${hazard.id})
Ward: ${hazard.location.ward} - ${hazard.location.address}
Severity: ${hazard.severity}/100 (${hazard.urgency})
Reporting Citizen: ${cleanCitizen} (${citizenEmail})
GPS: ${hazard.location.lat.toFixed(5)}, ${hazard.location.lng.toFixed(5)}

Inspect & Dispatch: https://mygovthub.web.app/`;

    const { error } = await supabase.from('mail_queue').insert([
      {
        to_email: ADMIN_EMAIL,
        subject,
        html,
        text,
        status: 'pending'
      }
    ]);

    if (error) {
      console.warn('[CIVIC-MAIL] Supabase mail queue notice (admin alert):', error);
      return false;
    }
    console.log(`[CIVIC-MAIL] Admin alert queued for hazard ${hazard.id} -> ${ADMIN_EMAIL}`);
    return true;
  } catch (err) {
    console.error('[CIVIC-MAIL] Failed to queue admin alert:', err);
    return false;
  }
}

/**
 * 2. Immediate Notification to Citizen when Municipal Admin issues Work Order (In Progress / Dispatched)
 */
export async function sendCitizenWorkOrderDispatchedEmail(
  hazard: HazardReport,
  workOrder: WorkOrder
): Promise<boolean> {
  try {
    const targetEmail = (hazard.citizenEmail || '').trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      console.log('[CIVIC-MAIL] No citizen email provided on hazard, skipping dispatch email.');
      return false;
    }

    const timestamp = getFormattedDate();
    const citizenName = (hazard.citizenName || 'Civic Scout').replace(/commissioner\s*/gi, '').trim();

    const subject = `🏛️ WORK ORDER DISPATCHED: Docket #${workOrder.orderId} for your Report [${hazard.id}]`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px 12px; color: #f8fafc; }
    .card { max-width: 620px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase; }
    .header p { margin: 4px 0 0 0; font-size: 12px; color: #e0f2fe; }
    .body { padding: 24px; }
    .badge-dispatch { display: inline-block; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; font-family: monospace; background-color: rgba(14, 165, 233, 0.2); color: #38bdf8; border: 1px solid #0284c7; }
    .detail-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .detail-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #334155; }
    .detail-table td.label { color: #94a3b8; font-weight: 600; width: 35%; }
    .detail-table td.val { color: #f1f5f9; font-weight: 700; }
    .cta-btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 12px; text-align: center; margin-top: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { text-align: center; font-size: 11px; color: #64748b; padding: 18px 24px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size: 28px; margin-bottom: 6px;">🏛️</div>
      <h1>Government of Tamil Nadu • Municipal Administration</h1>
      <p>OFFICIAL WORK ORDER DISPATCH ORDER • DOCKET #${workOrder.orderId}</p>
    </div>
    <div class="body">
      <div style="margin-bottom: 16px;">
        <span class="badge-dispatch">STATUS: IN PROGRESS • CONTRACTOR DISPATCHED</span>
      </div>

      <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6; margin: 0 0 12px 0;">
        Dear <strong>${citizenName}</strong>,
      </p>
      <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px 0;">
        Thank you for reporting the civil infrastructure defect. The Municipal Command Center has verified your grievance and officially issued an emergency Work Order Docket for prompt field remediation.
      </p>

      <table class="detail-table">
        <tr>
          <td class="label">Work Order Ref</td>
          <td class="val" style="font-family: monospace; color: #38bdf8;">${workOrder.orderId}</td>
        </tr>
        <tr>
          <td class="label">Reported Hazard</td>
          <td class="val">${hazard.title} (${hazard.id})</td>
        </tr>
        <tr>
          <td class="label">Location &amp; Ward</td>
          <td class="val">${hazard.location.address}<br/><span style="color: #94a3b8; font-size: 12px;">${hazard.location.ward}</span></td>
        </tr>
        <tr>
          <td class="label">Assigned Contractor</td>
          <td class="val" style="color: #facc15;">${workOrder.contractorTeam}</td>
        </tr>
        <tr>
          <td class="label">Contractor Helpline</td>
          <td class="val" style="font-family: monospace;">${workOrder.contactNumber}</td>
        </tr>
        <tr>
          <td class="label">Dispatch SLA</td>
          <td class="val" style="color: #f87171;">${workOrder.scheduledDispatch}</td>
        </tr>
        <tr>
          <td class="label">Allocated Budget</td>
          <td class="val">₹${workOrder.estimatedBudget.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td class="label">Dispatched Date</td>
          <td class="val">${timestamp}</td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://mygovthub.web.app/" class="cta-btn">Track Live Status on Citizen Portal →</a>
      </div>
    </div>
    <div class="footer">
      Department of Municipal Administration &amp; Water Supply • Govt of Tamil Nadu<br/>
      Official grievance tracking ID: ${hazard.id}
    </div>
  </div>
</body>
</html>
`;

    const text = `GOVERNMENT OF TAMIL NADU - OFFICIAL WORK ORDER DISPATCH
Dear ${citizenName},

Your civic report "${hazard.title}" (ID: ${hazard.id}) has been assigned to field contractor:
Contractor: ${workOrder.contractorTeam} (${workOrder.contactNumber})
Work Order ID: ${workOrder.orderId}
SLA Priority: ${workOrder.scheduledDispatch}
Location: ${hazard.location.address}, ${hazard.location.ward}

Track live: https://mygovthub.web.app/`;

    const { error } = await supabase.from('mail_queue').insert([
      {
        to_email: targetEmail,
        subject,
        html,
        text,
        status: 'pending'
      }
    ]);

    if (error) {
      console.warn('[CIVIC-MAIL] Supabase mail queue notice (citizen dispatch):', error);
      return false;
    }
    console.log(`[CIVIC-MAIL] Work order dispatch email queued for ${targetEmail}`);
    return true;
  } catch (err) {
    console.error('[CIVIC-MAIL] Failed to queue work order dispatch email:', err);
    return false;
  }
}

/**
 * 3. Immediate Notification to Citizen when Hazard Work is Completed
 */
export async function sendCitizenWorkCompletedEmail(hazard: HazardReport): Promise<boolean> {
  try {
    const targetEmail = (hazard.citizenEmail || '').trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      console.log('[CIVIC-MAIL] No citizen email provided on hazard, skipping completion email.');
      return false;
    }

    const timestamp = getFormattedDate();
    const citizenName = (hazard.citizenName || 'Civic Scout').replace(/commissioner\s*/gi, '').trim();

    const subject = `✅ REPAIR COMPLETED: Official Closure of Incident [${hazard.id}] - MyGovt AI Hub`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px 12px; color: #f8fafc; }
    .card { max-width: 620px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase; }
    .header p { margin: 4px 0 0 0; font-size: 12px; color: #d1fae5; }
    .body { padding: 24px; }
    .badge-completed { display: inline-block; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; font-family: monospace; background-color: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
    .detail-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .detail-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #334155; }
    .detail-table td.label { color: #94a3b8; font-weight: 600; width: 35%; }
    .detail-table td.val { color: #f1f5f9; font-weight: 700; }
    .cta-btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #022c22; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 12px; text-align: center; margin-top: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { text-align: center; font-size: 11px; color: #64748b; padding: 18px 24px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size: 32px; margin-bottom: 6px;">🎉</div>
      <h1>Government of Tamil Nadu • Municipal Administration</h1>
      <p>OFFICIAL WORK COMPLETION &amp; REPAIR CLOSURE CERTIFICATE</p>
    </div>
    <div class="body">
      <div style="margin-bottom: 16px;">
        <span class="badge-completed">STATUS: 100% REPAIRED &amp; INSPECTION VERIFIED</span>
      </div>

      <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6; margin: 0 0 12px 0;">
        Dear <strong>${citizenName}</strong>,
      </p>
      <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px 0;">
        We are pleased to inform you that the physical civil repair work for your reported incident has been <strong>successfully completed</strong> and audited by Municipal Field Engineers.
      </p>

      <table class="detail-table">
        <tr>
          <td class="label">Incident Ref</td>
          <td class="val" style="font-family: monospace; color: #34d399;">${hazard.id}</td>
        </tr>
        <tr>
          <td class="label">Defect Resolved</td>
          <td class="val">${hazard.title}</td>
        </tr>
        <tr>
          <td class="label">Location</td>
          <td class="val">${hazard.location.address}<br/><span style="color: #94a3b8; font-size: 12px;">${hazard.location.ward}</span></td>
        </tr>
        ${hazard.workOrder ? `
        <tr>
          <td class="label">Executed Under Docket</td>
          <td class="val" style="font-family: monospace;">${hazard.workOrder.orderId}</td>
        </tr>
        <tr>
          <td class="label">Remediation Team</td>
          <td class="val">${hazard.workOrder.contractorTeam}</td>
        </tr>` : ''}
        <tr>
          <td class="label">Ecological Benefit</td>
          <td class="val" style="color: #6ee7b7;">Mitigated CO2 emissions &amp; restored civic mobility</td>
        </tr>
        <tr>
          <td class="label">Completion Date</td>
          <td class="val">${timestamp}</td>
        </tr>
      </table>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin: 16px 0 0 0;">
        🌟 Your active participation as a vigilant citizen helps make Tamil Nadu cities safer and more resilient.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://mygovthub.web.app/" class="cta-btn">View Official Certificate on Portal →</a>
      </div>
    </div>
    <div class="footer">
      Department of Municipal Administration &amp; Water Supply • Govt of Tamil Nadu<br/>
      Incident closure confirmed on ${timestamp}
    </div>
  </div>
</body>
</html>
`;

    const text = `GOVERNMENT OF TAMIL NADU - OFFICIAL CLOSURE CERTIFICATE
Dear ${citizenName},

Your reported hazard "${hazard.title}" (ID: ${hazard.id}) located at ${hazard.location.address}, ${hazard.location.ward} has been fully repaired and verified by the Municipal Engineering Team!

Thank you for reporting!
View on portal: https://mygovthub.web.app/`;

    const { error } = await supabase.from('mail_queue').insert([
      {
        to_email: targetEmail,
        subject,
        html,
        text,
        status: 'pending'
      }
    ]);

    if (error) {
      console.warn('[CIVIC-MAIL] Supabase mail queue notice (completion):', error);
      return false;
    }
    console.log(`[CIVIC-MAIL] Work completion email queued for ${targetEmail}`);
    return true;
  } catch (err) {
    console.error('[CIVIC-MAIL] Failed to queue work completion email:', err);
    return false;
  }
}

/**
 * 4. Client-side Work Order Generator (100% reliable on static hosting)
 */
export function generateWorkOrderClient(hazard: HazardReport): WorkOrder {
  const contractors = {
    pothole: { name: 'City Rapid Pavement Logistics Div-2', phone: '+91 80 2297 5000' },
    water_leak: { name: 'Municipal Hydro Utilities Emergency Unit', phone: '+91 80 2297 5210' },
    structural_crack: { name: 'Urban Bridge & Heavy Infrastructure Bureau', phone: '+91 80 2297 5440' },
    illegal_waste: { name: 'GreenCity Bio-Hazard & Solid Waste Fleet', phone: '+91 80 2297 5880' },
    electrical_hazard: { name: 'Smart Power Grid Emergency Team', phone: '+91 80 2297 5340' },
    solar_infrastructure: { name: 'Renewable Micro-Grid Maintenance Cell', phone: '+91 80 2297 5600' }
  };

  const contractor = contractors[hazard.type as keyof typeof contractors] || contractors.pothole;
  const priorityLevel = hazard.severity >= 85 ? 'CRITICAL' : hazard.severity >= 65 ? 'HIGH' : 'MODERATE';

  const materialsMap: Record<string, string[]> = {
    pothole: ['Polymer Cold Asphalt 300kg', 'Bitumen Emulsion RS-1', 'Road Warning Barricades'],
    water_leak: ['DI Pipe Collar 300mm', 'Sluice Valve Seal Kit', 'Sump Pump 15HP'],
    structural_crack: ['Structural Epoxy Grout', 'Carbon Fiber CFRP Laminates', 'Pore Pressure Sensors'],
    illegal_waste: ['Bio-Degradable Waste Enclosures', 'High-Capacity Loader Trux', 'Lime Disinfectant Spray'],
    electrical_hazard: ['LED Luminaire 90W', 'Arm Mount Bracket', 'Surge Protector 10kV'],
    solar_infrastructure: ['Bifacial Solar Module 540W', 'MC4 Inline Connectors', 'DC Breaker 1000V']
  };

  return {
    orderId: `WO-MUN-${Math.floor(1000 + Math.random() * 9000)}`,
    contractorTeam: contractor.name,
    contactNumber: contractor.phone,
    priorityLevel,
    scheduledDispatch: hazard.severity >= 85 ? 'IMMEDIATE DISPATCH (T-30 MINS)' : 'SCHEDULED (NEXT MORNING SHIFT)',
    estimatedRepairHours: parseFloat((hazard.severity / 16).toFixed(1)),
    requiredMaterials: materialsMap[hazard.type] || ['Standard Civil Maintenance Kit', 'Safety Bollards'],
    estimatedBudget: Math.round((hazard.severity * 280) + 5000),
    co2MitigationImpact: `Mitigates ${Math.round(hazard.severity * 0.85)} kg CO2 equivalent and prevents civic disruption in ${hazard.location.ward || 'Metropolitan Ward'}.`,
    status: 'DISPATCHED'
  };
}
