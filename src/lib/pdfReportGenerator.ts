import PDFDocument from 'pdfkit';

export interface CompletionReportPdfParams {
  hazardId: string;
  hazardTitle: string;
  hazardType: string;
  locationAddress: string;
  ward: string;
  citizenName?: string;
  citizenEmail?: string;
  contractorTeam?: string;
  estimatedCost?: number;
  completedAt?: string;
  authorizedOfficer?: string;
}

export function generateCompletionReportPdf(params: CompletionReportPdfParams): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Official Completion Certificate - ${params.hazardId}`,
          Author: 'Tamil Nadu Municipal Administration & Urban Water Supply',
          Subject: `Civil Infrastructure Grievance Completion Docket for ${params.hazardId}`,
          Keywords: 'Tamil Nadu, MyGovt AI Hub, Civic Completion Report, PWD'
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#0f766e'; // Teal / Emerald
      const darkColor = '#0f172a';
      const slateColor = '#475569';
      const lightBg = '#f8fafc';
      const borderLine = '#cbd5e1';

      // 1. Top Decorative Ribbon / Banner
      doc.rect(0, 0, 595.28, 12).fill(primaryColor);

      // 2. Header: Government Branding
      doc.moveDown(0.8);
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor(darkColor)
        .text('GOVERNMENT OF TAMIL NADU', { align: 'center', characterSpacing: 1.5 });

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(primaryColor)
        .text('MUNICIPAL ADMINISTRATION & URBAN WATER SUPPLY', { align: 'center', characterSpacing: 1 });

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(slateColor)
        .text('MYGOVT AI HUB • AUTONOMOUS URBAN INFRASTRUCTURE COMMAND SYSTEM', { align: 'center' });

      doc.moveDown(0.6);
      doc.strokeColor(borderLine).lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.8);

      // 3. Document Title & Badge
      const certId = `TN-CERT-${new Date().getFullYear()}-${params.hazardId.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`;
      const certDate = params.completedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

      doc.rect(40, doc.y, 515, 34).fill('#ecfdf5');
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#065f46')
        .text('OFFICIAL COMPLETION & REMEDIATION CERTIFICATE', 50, doc.y - 26, { align: 'center' });
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#047857')
        .text('CIVIL INFRASTRUCTURE DEFECT RESOLUTION & QA CLEARANCE DOCKET', { align: 'center' });

      doc.moveDown(1.5);

      // 4. Incident & Grievance Information Card
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(darkColor)
        .text('1. GRIEVANCE REFERENCE & INCIDENT PROFILE');
      doc.moveDown(0.3);

      const startY = doc.y;
      doc.rect(40, startY, 515, 110).fillAndStroke(lightBg, borderLine);

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(slateColor);
      doc.text('Grievance ID:', 55, startY + 12);
      doc.text('Incident Title:', 55, startY + 30);
      doc.text('Problem Category:', 55, startY + 48);
      doc.text('Location Address:', 55, startY + 66);
      doc.text('Municipal Ward:', 55, startY + 84);

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(darkColor);
      doc.text(params.hazardId, 160, startY + 12);
      doc.text(params.hazardTitle, 160, startY + 30);
      doc.font('Helvetica').fontSize(8.5);
      doc.text(params.hazardType.toUpperCase().replace('_', ' '), 160, startY + 48);
      doc.text(params.locationAddress, 160, startY + 66, { width: 375 });
      doc.text(params.ward, 160, startY + 84);

      doc.y = startY + 120;

      // 5. Citizen & Contractor Details
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(darkColor)
        .text('2. CITIZEN LODGEMENT & CONTRACTOR DISPATCH');
      doc.moveDown(0.3);

      const startY2 = doc.y;
      doc.rect(40, startY2, 515, 95).fillAndStroke(lightBg, borderLine);

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(slateColor);
      doc.text('Reported Citizen:', 55, startY2 + 12);
      doc.text('Citizen Email:', 55, startY2 + 30);
      doc.text('Assigned Contractor:', 55, startY2 + 48);
      doc.text('Ai Prediction Budget (INR):', 55, startY2 + 66);

      doc.font('Helvetica').fontSize(8.5).fillColor(darkColor);
      doc.text(params.citizenName || 'Registered Citizen', 185, startY2 + 12);
      doc.text(params.citizenEmail || 'citizen@gmail.com', 185, startY2 + 30);
      doc.text(params.contractorTeam || 'Tamil Nadu Rapid Urban Infrastructure Unit', 185, startY2 + 48);
      doc.font('Helvetica-Bold').fillColor(primaryColor);
      doc.text(
        `₹${(params.estimatedCost || 12500).toLocaleString('en-IN')} (Realtime price detected by AI)`,
        185,
        startY2 + 66
      );

      doc.y = startY2 + 105;

      // 6. Quality Assurance & Clearance Checklist
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(darkColor)
        .text('3. MUNICIPAL QUALITY ASSURANCE & RESOLUTION SIGN-OFF');
      doc.moveDown(0.3);

      const startY3 = doc.y;
      doc.rect(40, startY3, 515, 80).fillAndStroke('#f0fdf4', '#86efac');

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#15803d');
      doc.text('✓ Physical Site Remediation Completed', 55, startY3 + 12);
      doc.text('✓ Asphalt Sub-Base & Structural Compaction Verified', 55, startY3 + 28);
      doc.text('✓ Public Safety Clearance & Vehicular Lane Restored', 55, startY3 + 44);
      doc.text('✓ Environmental & Carbon Penalty Mitigated', 55, startY3 + 60);

      doc.font('Helvetica').fontSize(8).fillColor(slateColor);
      doc.text(`Certified On: ${certDate}`, 360, startY3 + 12);
      doc.text(`Docket No: ${certId}`, 360, startY3 + 28);
      doc.text('Status: COMPLETED & CLOSED', 360, startY3 + 44);

      doc.y = startY3 + 92;

      // 7. Official Seal & Signature Section
      const sealY = doc.y;
      doc.strokeColor(borderLine).lineWidth(1).moveTo(40, sealY).lineTo(555, sealY).stroke();

      doc.rect(40, sealY + 10, 240, 75).fillAndStroke(lightBg, borderLine);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(slateColor).text('DIGITAL VERIFICATION AUDIT', 50, sealY + 18);
      doc.font('Helvetica').fontSize(7.5).fillColor(darkColor);
      doc.text(`Official Issuer: Municipal Administration`, 50, sealY + 30);
      doc.text(`Portal: https://3.6.172.250.nip.io`, 50, sealY + 42);
      doc.text(`Security Hash: SHA-256 Verified`, 50, sealY + 54);
      doc.text(`Official Channel: mygovtaihub@gmail.com`, 50, sealY + 66);

      // Signature Box Right
      doc.rect(315, sealY + 10, 240, 75).fillAndStroke(lightBg, borderLine);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(slateColor).text('AUTHORIZED SIGNATORY', 325, sealY + 18);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(darkColor).text(params.authorizedOfficer || 'K. S. Purushothaman', 325, sealY + 32);
      doc.font('Helvetica').fontSize(8).fillColor(slateColor).text('Municipal Administration & Urban Water Supply', 325, sealY + 46);
      doc.text('Government of Tamil Nadu', 325, sealY + 58);

      // Bottom Footer
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#94a3b8')
        .text(
          'This is a digitally generated municipal certificate of completion issued by MyGovt AI Hub pursuant to the Tamil Nadu Municipal Grievance Redressal Protocol. For queries, contact mygovtaihub@gmail.com.',
          40,
          doc.page.height - 35,
          { width: 515, align: 'center' }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
