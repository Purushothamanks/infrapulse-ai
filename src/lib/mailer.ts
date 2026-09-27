import nodemailer from 'nodemailer';
import { generateCompletionReportPdf } from './pdfReportGenerator';
import { HazardReport } from '@/types/hazard';

const SENDER_EMAIL = process.env.SMTP_SENDER_EMAIL || 'mygovtaihub@gmail.com';
const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || 'mygovtaihub@gmail.com';

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;
  const from = `"MyGovt AI Hub" <${SENDER_EMAIL}>`;

  return { host, port, user, pass, from };
}

function getFormattedIndianDate(): string {
  try {
    return new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (_) {
    return '27 September, 2026';
  }
}

/**
 * Standard Government of Tamil Nadu Official Memorandum (OM) Email Wrapper
 */
function renderOfficialMemorandumHtml({
  omNumber,
  dated,
  subject,
  reference,
  bodyParagraphs,
  signatoryName,
  signatoryDesignation,
  signatoryDept = 'Department of Municipal Administration & Urban Water Supply',
  recipientName,
  recipientEmail,
  copyToList = [
    'Municipal Incident Command Grid, Ezhilagam Complex, Chepauk, Chennai.',
    'Autonomous AI Infrastructure Monitoring Cell (MyGovt AI Hub).',
    'Field Engineering & Rapid Response Directorate, Tamil Nadu.'
  ]
}: {
  omNumber: string;
  dated: string;
  subject: string;
  reference?: string;
  bodyParagraphs: string[];
  signatoryName: string;
  signatoryDesignation: string;
  signatoryDept?: string;
  recipientName: string;
  recipientEmail: string;
  copyToList?: string[];
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Official Memorandum - ${omNumber}</title>
  <style>
    body {
      margin: 0;
      padding: 24px 12px;
      background-color: #f1f5f9;
      font-family: 'Times New Roman', Times, Georgia, serif;
      -webkit-font-smoothing: antialiased;
      color: #0f172a;
    }
    p { margin: 0 0 14px 0; line-height: 1.7; text-align: justify; }
    table { border-collapse: collapse; }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: 'Times New Roman', Times, Georgia, serif; color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 640px; margin: 0 auto;">
    <tr>
      <td>
        <!-- Main OM Paper Sheet -->
        <div style="background-color: #ffffff; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); padding: 36px 32px; border-radius: 4px;">
          
          <!-- Government Emblem & Department Header -->
          <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px;">
            <div style="font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #047857; margin-bottom: 4px;">
              GOVERNMENT OF TAMIL NADU
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.3;">
              DEPARTMENT OF MUNICIPAL ADMINISTRATION &amp; URBAN WATER SUPPLY
            </div>
            <div style="font-size: 12px; color: #475569; margin-top: 4px; font-style: italic;">
              Ezhilagam Complex, Chepauk, Chennai - 600 005 • MyGovt AI Hub Command Cell
            </div>
          </div>

          <!-- OM Number & Date Bar -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 18px; font-size: 13px; color: #1e293b;">
            <tr>
              <td align="left" style="font-family: 'Courier New', Courier, monospace; font-weight: 700; color: #0f172a;">
                No. ${omNumber}
              </td>
              <td align="right" style="font-weight: 600;">
                Dated: ${dated}
              </td>
            </tr>
          </table>

          <!-- OFFICIAL MEMORANDUM Title Header -->
          <div style="text-align: center; margin: 20px 0 24px 0;">
            <span style="display: inline-block; font-size: 15px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 3px;">
              OFFICIAL MEMORANDUM
            </span>
          </div>

          <!-- Subject & Reference (Sub & Ref) Block -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 22px; font-size: 13.5px; line-height: 1.6;">
            <tr>
              <td style="width: 55px; vertical-align: top; font-weight: 800; color: #0f172a;">Sub:</td>
              <td style="vertical-align: top; font-weight: 700; color: #0f172a; text-align: justify;">
                ${subject}
              </td>
            </tr>
            ${reference ? `
            <tr>
              <td style="width: 55px; vertical-align: top; font-weight: 800; color: #0f172a; padding-top: 8px;">Ref:</td>
              <td style="vertical-align: top; color: #334155; padding-top: 8px; text-align: justify;">
                ${reference}
              </td>
            </tr>
            ` : ''}
          </table>

          <div style="border-top: 1px solid #e2e8f0; margin-bottom: 20px;"></div>

          <!-- Numbered Body Paragraphs -->
          <div style="font-size: 13.5px; color: #0f172a; line-height: 1.75;">
            ${bodyParagraphs.map((para, idx) => `
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="width: 26px; vertical-align: top; font-weight: 800; color: #0f172a;">${idx + 1}.</td>
                  <td style="vertical-align: top; text-align: justify; color: #1e293b;">
                    ${para}
                  </td>
                </tr>
              </table>
            `).join('')}
          </div>

          <!-- Formal Officer Signature Block -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px; margin-bottom: 28px;">
            <tr>
              <td align="right">
                <div style="text-align: right; display: inline-block;">
                  <div style="font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 4px;">(Sd/-)</div>
                  <div style="font-size: 15px; font-weight: 800; color: #0f172a; letter-spacing: 0.3px;">${signatoryName}</div>
                  <div style="font-size: 12px; font-weight: 600; color: #334155;">${signatoryDesignation}</div>
                  <div style="font-size: 12px; color: #475569;">${signatoryDept}</div>
                  <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase;">Government of Tamil Nadu</div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Distribution / Endorsement Block (To & Copy to) -->
          <div style="border-top: 1.5px solid #0f172a; padding-top: 18px; font-size: 12.5px; line-height: 1.6; color: #1e293b;">
            <div style="font-weight: 800; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">To:</div>
            <div style="padding-left: 14px; margin-bottom: 16px;">
              <strong>${recipientName}</strong><br />
              <span style="font-family: 'Courier New', Courier, monospace; color: #0284c7;">${recipientEmail}</span>
            </div>

            <div style="font-weight: 800; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Copy forwarded for information and record to:</div>
            <div style="padding-left: 14px; font-size: 11.5px; color: #475569;">
              ${copyToList.map((item, i) => `<div>${i + 1}. ${item}</div>`).join('')}
            </div>
          </div>

          <!-- Official Document Footer -->
          <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 12px; text-align: center; font-size: 11px; color: #94a3b8; font-style: italic;">
            This is an authentic Government Official Memorandum dispatched electronically via MyGovt AI Hub Autonomous Grid.
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 1. Dispatches the Permanent Municipal Security Card to the Admin in Official Memorandum (OM) format.
 */
export async function sendAdminSecurityCardEmail({
  toEmail,
  recipientName = 'K. S. Purushothaman',
  cardNumber,
  department = 'Tamil Nadu Municipal Administration & Urban Water Supply'
}: {
  toEmail: string;
  recipientName?: string;
  cardNumber: string;
  department?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { host, port, user, pass, from } = getSmtpConfig();
  const dated = getFormattedIndianDate();
  const omNumber = `MAWS/OM/${new Date().getFullYear()}/SEC-${Math.floor(1000 + Math.random() * 9000)}`;

  console.log(`[AUTH-CARD-OM] Issuing OM Permanent Security Card to ${toEmail}: ${cardNumber}`);

  if (!user || !pass) {
    console.warn('[AUTH-CARD-WARN] SMTP credentials not set in environment.');
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const subject = `MUNICIPAL COMMAND CENTER — ALLOCATION AND ISSUANCE OF PERMANENT MUNICIPAL SECURITY ACCESS CARD.`;
    const reference = `Security Authentication Protocol under Tamil Nadu Urban Infrastructure Governance Directive 2026.`;

    const cardTable = `
      <div style="background-color: #f8fafc; border: 1.5px solid #0f172a; padding: 18px; margin: 12px 0; border-radius: 4px;">
        <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 12.5px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569; width: 40%;">Official Credential Type:</td>
            <td style="font-weight: 800; color: #047857; text-transform: uppercase;">Permanent Municipal Security Card</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Card Identification Number:</td>
            <td style="font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: 2px;">
              ${cardNumber}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Designated Officer:</td>
            <td style="font-weight: 700; color: #0f172a;">${recipientName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Authorized Email ID:</td>
            <td style="font-family: 'Courier New', Courier, monospace; color: #0f172a;">${toEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Department:</td>
            <td style="color: #0f172a;">${department}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">Validity &amp; Term:</td>
            <td style="font-weight: 700; color: #047857;">PERMANENT • NON-EXPIRING</td>
          </tr>
        </table>
      </div>
    `;

    const bodyParagraphs = [
      `The undersigned is directed to convey the official allocation and issuance of the <strong>Permanent Municipal Security Access Card</strong> in favour of <strong>${recipientName}</strong> for authenticated administrative access to the Municipal Incident Command Center.`,
      `The technical specifications and credential particulars of the issued card are tabulated below for official record: ${cardTable}`,
      `The officer is strictly instructed to retain this <strong>Permanent Card Number</strong> securely. The card number shall be required for authenticating all future logins into the Command Center. No one-time passcode (OTP) shall be requisitioned for card-authenticated sessions.`,
      `This issues with the approval of the Competent Municipal Authority, Government of Tamil Nadu.`
    ];

    const html = renderOfficialMemorandumHtml({
      omNumber,
      dated,
      subject,
      reference,
      bodyParagraphs,
      signatoryName: 'K. S. Purushothaman',
      signatoryDesignation: 'Authorized Municipal Authority',
      signatoryDept: department,
      recipientName,
      recipientEmail: toEmail
    });

    await transporter.sendMail({
      from,
      sender: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      envelope: {
        from: SENDER_EMAIL,
        to: toEmail
      },
      to: toEmail,
      subject: `[OFFICIAL MEMORANDUM] No. ${omNumber}: Issuance of Permanent Municipal Security Card`,
      text: `GOVERNMENT OF TAMIL NADU - OFFICIAL MEMORANDUM (No. ${omNumber})\n\nSub: Issuance of Permanent Municipal Security Access Card.\n\nYour Permanent Card Number is: ${cardNumber}.\nIssued To: ${recipientName}\nAuthorized Email: ${toEmail}\n\nSave this permanent card number for future admin logins.`,
      html
    });

    console.log(`[AUTH-CARD-SUCCESS] Official Memorandum card email dispatched to ${toEmail}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[AUTH-CARD-ERROR] Failed to send OM card email to ${toEmail}:`, err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * 2. Dispatches OTP verification in Official Memorandum (OM) format for Citizen onboarding.
 */
export async function sendOtpEmail({
  toEmail,
  otp,
  recipientName,
  role
}: {
  toEmail: string;
  otp: string;
  recipientName?: string;
  role: 'admin' | 'citizen';
  officialId?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { host, port, user, pass, from } = getSmtpConfig();
  const dated = getFormattedIndianDate();
  const omNumber = `MAWS/OM/${new Date().getFullYear()}/OTP-${Math.floor(1000 + Math.random() * 9000)}`;

  console.log(`[AUTH-OTP-OM] Generated OM OTP for ${toEmail} (${role}): ${otp}`);

  if (!user || !pass) {
    console.warn('[AUTH-EMAIL-WARN] SMTP credentials not set.');
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const isOfficial = role === 'admin';
    const recipientTitle = isOfficial ? 'Municipal Administrator' : (recipientName || 'Citizen Applicant');
    const subject = `MYGOVT AI HUB — TRANSMISSION OF ONE-TIME PASSCODE (OTP) FOR IDENTITY VERIFICATION.`;
    const reference = `Electronic Citizen Onboarding / Authentication Request initiated on ${dated}.`;

    const otpBox = `
      <div style="background-color: #f8fafc; border: 1.5px solid #0f172a; padding: 20px; margin: 12px 0; text-align: center; border-radius: 4px;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #475569; margin-bottom: 6px;">
          AUTHENTICATION PASSCODE (OTP)
        </div>
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', Courier, monospace;">
          ${otp}
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
          Passcode Validity: <strong>10 Minutes</strong> • Single Session Use Only
        </div>
      </div>
    `;

    const bodyParagraphs = [
      `The undersigned is directed to communicate the official One-Time Passcode (OTP) requisitioned for authentication and identity verification on the MyGovt AI Hub portal for <strong>${recipientTitle}</strong>.`,
      `The official authentication credentials are provided as follows: ${otpBox}`,
      `The recipient is informed that this verification passcode is strictly personal, non-transferable, and shall expire automatically in ten (10) minutes from dispatch. Under no circumstances should this code be disclosed to any unauthorized individual.`,
      `This issues under the Digital Identity and Civic Service Protocol of the Government of Tamil Nadu.`
    ];

    const html = renderOfficialMemorandumHtml({
      omNumber,
      dated,
      subject,
      reference,
      bodyParagraphs,
      signatoryName: 'K. S. Purushothaman',
      signatoryDesignation: 'Executive Authentication Authority',
      signatoryDept: 'Department of Municipal Administration & Urban Water Supply',
      recipientName: recipientTitle,
      recipientEmail: toEmail
    });

    await transporter.sendMail({
      from,
      sender: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      envelope: {
        from: SENDER_EMAIL,
        to: toEmail
      },
      to: toEmail,
      subject: `[OFFICIAL MEMORANDUM] No. ${omNumber}: Identity Verification Passcode`,
      text: `GOVERNMENT OF TAMIL NADU - OFFICIAL MEMORANDUM (No. ${omNumber})\n\nSub: One-Time Passcode (OTP) for Identity Verification.\n\nYour Verification Passcode is: ${otp}\nValid for 10 minutes. Do not share with anyone.`,
      html
    });

    console.log(`[AUTH-EMAIL-SUCCESS] Official Memorandum OTP email dispatched to ${toEmail}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[AUTH-EMAIL-ERROR] Failed to send OM OTP email to ${toEmail}:`, err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * 3. Dispatches civic grievance status update in Official Memorandum (OM) format to the citizen,
 * attaching the official completion report PDF certificate when marked as Completed.
 */
export async function sendGrievanceStatusEmail({
  toEmail,
  hazardId,
  hazardTitle,
  hazardType = 'pothole',
  newStatus,
  citizenName,
  locationAddress,
  ward,
  contractorTeam,
  scheduledDispatch,
  workOrderId,
  estimatedCost = 12500
}: {
  toEmail: string;
  hazardId: string;
  hazardTitle: string;
  hazardType?: string;
  newStatus: string;
  citizenName?: string;
  locationAddress: string;
  ward: string;
  contractorTeam?: string;
  scheduledDispatch?: string;
  workOrderId?: string;
  estimatedCost?: number;
}): Promise<{ success: boolean; error?: string }> {
  const { host, port, user, pass, from } = getSmtpConfig();
  const dated = getFormattedIndianDate();
  const omNumber = `MAWS/OM/${new Date().getFullYear()}/GRV-${hazardId}`;

  if (!user || !pass) {
    console.warn(`[STATUS-EMAIL-WARN] SMTP credentials not set.`);
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const isCompleted = newStatus === 'Completed';
    const statusText = isCompleted ? 'COMPLETED & RESOLVED' : 'WORK IN PROGRESS';
    const subject = `PUBLIC GRIEVANCE REDRESSAL — STATUS UPDATE ON RECTIFICATION OF INFRASTRUCTURE DEFECT (${hazardTitle.toUpperCase()}).`;
    const reference = `Citizen Grievance Lodgement Docket No. ${hazardId} registered under Municipal Ward ${ward}.`;

    // Generate Official PDF Docket if status is Completed
    let pdfAttachment: any = null;
    if (isCompleted) {
      try {
        console.log(`[PDF-GEN] Generating official completion docket for ${hazardId}...`);
        const pdfBuffer = await generateCompletionReportPdf({
          hazardId,
          hazardTitle,
          hazardType,
          locationAddress,
          ward,
          citizenName: citizenName || 'Civic Scout',
          citizenEmail: toEmail,
          contractorTeam: contractorTeam || 'Tamil Nadu Rapid Infrastructure Unit',
          estimatedCost,
          completedAt: dated,
          authorizedOfficer: 'K. S. Purushothaman'
        });

        pdfAttachment = {
          filename: `Official_Completion_Report_${hazardId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        };
        console.log(`[PDF-GEN-SUCCESS] Completion certificate attached (${pdfBuffer.length} bytes).`);
      } catch (pdfErr) {
        console.error('[PDF-GEN-ERROR] Failed to generate PDF certificate:', pdfErr);
      }
    }

    const dossierTable = `
      <div style="background-color: #f8fafc; border: 1.5px solid #0f172a; padding: 18px; margin: 12px 0; border-radius: 4px;">
        <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 12.5px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569; width: 40%;">Grievance Docket ID:</td>
            <td style="font-family: 'Courier New', Courier, monospace; font-weight: 800; color: #0284c7;">${hazardId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Defect Title:</td>
            <td style="font-weight: 700; color: #0f172a;">${hazardTitle}</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Location &amp; Ward:</td>
            <td style="color: #0f172a;">${locationAddress} (${ward})</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Present Execution Stage:</td>
            <td style="font-weight: 800; color: ${isCompleted ? '#047857' : '#b45309'}; text-transform: uppercase;">${statusText}</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Ai Prediction Budget (INR):</td>
            <td style="font-family: 'Courier New', Courier, monospace; font-weight: 800; color: #047857;">₹${estimatedCost.toLocaleString('en-IN')} <span style="font-weight: 400; color: #64748b; font-size: 11px;">(Realtime price detected by AI)</span></td>
          </tr>
          ${workOrderId ? `
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Sanctioned Work Order:</td>
            <td style="font-family: 'Courier New', Courier, monospace; color: #0f172a;">${workOrderId}</td>
          </tr>
          ` : ''}
          ${contractorTeam ? `
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Assigned Engineering Crew:</td>
            <td style="color: #0f172a;">${contractorTeam}</td>
          </tr>
          ` : ''}
          ${scheduledDispatch ? `
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Dispatch Schedule:</td>
            <td style="color: #0f172a;">${scheduledDispatch}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="font-weight: 700; color: #475569;">Certifying Official:</td>
            <td style="font-weight: 700; color: #0f172a;">K. S. Purushothaman (Municipal Administration)</td>
          </tr>
        </table>
      </div>
    `;

    const bodyParagraphs = [
      `With reference to the civic grievance registered under Docket No. <strong>${hazardId}</strong> regarding defect <strong>"${hazardTitle}"</strong>, it is hereby communicated that municipal engineering crews have inspected the site and advanced the execution status to <strong>${statusText}</strong>.`,
      `The technical particulars and financial assessment of the rectification works are detailed hereunder for information: ${dossierTable}`,
      isCompleted
        ? `The official <strong>Government of Tamil Nadu Completion &amp; Engineering Quality Assurance Docket</strong> has been verified, certified, and is enclosed herewith as a PDF attachment for permanent civic record.`
        : `Field engineering crews have been dispatched to execute the necessary repairs in accordance with the municipal SLA schedule. A follow-up Official Memorandum along with the certified Completion Report will be dispatched upon final engineering certification.`,
      `This issues under the authority of the Municipal Administration &amp; Urban Water Supply, Government of Tamil Nadu.`
    ];

    const html = renderOfficialMemorandumHtml({
      omNumber,
      dated,
      subject,
      reference,
      bodyParagraphs,
      signatoryName: 'K. S. Purushothaman',
      signatoryDesignation: 'Executive Municipal Authority',
      signatoryDept: 'Department of Municipal Administration & Urban Water Supply',
      recipientName: citizenName || 'Civic Scout',
      recipientEmail: toEmail
    });

    const mailOptions: any = {
      from,
      sender: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      envelope: {
        from: SENDER_EMAIL,
        to: toEmail
      },
      to: toEmail,
      subject: `[OFFICIAL MEMORANDUM] No. ${omNumber}: Grievance Status - ${hazardTitle}`,
      text: `GOVERNMENT OF TAMIL NADU - OFFICIAL MEMORANDUM (No. ${omNumber})\n\nSub: Public Grievance Redressal Status for "${hazardTitle}".\nStatus: ${statusText}.\nLocation: ${locationAddress} (${ward})\nAi Prediction Budget: ₹${estimatedCost.toLocaleString('en-IN')}.${isCompleted ? ' Official Completion PDF Certificate is attached.' : ''}`,
      html
    };

    if (pdfAttachment) {
      mailOptions.attachments = [pdfAttachment];
    }

    await transporter.sendMail(mailOptions);

    console.log(`[STATUS-EMAIL-SUCCESS] Official Memorandum status email sent to ${toEmail} for ${hazardTitle}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[STATUS-EMAIL-ERROR] Failed to send OM status email to ${toEmail}:`, err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * 4. Immediate Admin Alert Email dispatched to mygovtaihub@gmail.com in Official Memorandum (OM) format.
 */
export async function sendNewHazardAdminAlertEmail({
  hazard
}: {
  hazard: HazardReport;
}): Promise<{ success: boolean; error?: string }> {
  const { host, port, user, pass, from } = getSmtpConfig();
  const dated = getFormattedIndianDate();
  const omNumber = `MAWS/OM/${new Date().getFullYear()}/INC-${hazard.id}`;

  if (!user || !pass) {
    console.warn('[ADMIN-ALERT-WARN] SMTP not configured. Skipping admin alert.');
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const estimatedCost = hazard.aiAnalysis?.estimatedCost || 12500;
    const subject = `URGENT INCIDENT INGESTION & PRIORITY FIELD DISPATCH DIRECTIVE — ${hazard.id} (${hazard.location.ward}).`;
    const reference = `Autonomous Vision AI Triage Ingestion Grid Report dated ${dated}.`;

    const incidentTable = `
      <div style="background-color: #f8fafc; border: 1.5px solid #0f172a; padding: 18px; margin: 12px 0; border-radius: 4px;">
        <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 12.5px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569; width: 40%;">Incident Identifier:</td>
            <td style="font-family: 'Courier New', Courier, monospace; font-weight: 800; color: #b91c1c;">${hazard.id}</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Defect Title:</td>
            <td style="font-weight: 700; color: #0f172a;">${hazard.title}</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Category &amp; Severity:</td>
            <td style="font-weight: 800; color: #b91c1c; text-transform: uppercase;">${hazard.type.replace('_', ' ')} • ${hazard.urgency} [${hazard.severity}/100]</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Location Address:</td>
            <td style="color: #0f172a;">${hazard.location.address}</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Municipal Ward:</td>
            <td style="font-weight: 700; color: #0f172a;">${hazard.location.ward}</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">GPS Coordinates:</td>
            <td style="font-family: 'Courier New', Courier, monospace; color: #0f172a;">${hazard.location.lat.toFixed(5)}° N, ${hazard.location.lng.toFixed(5)}° E</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Reporting Citizen:</td>
            <td style="color: #0f172a;">${hazard.citizenName || 'Civilian'} (${hazard.citizenEmail || 'N/A'})</td>
          </tr>
          <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="font-weight: 700; color: #475569;">Ai Prediction Budget (INR):</td>
            <td style="font-family: 'Courier New', Courier, monospace; font-weight: 800; color: #047857;">₹${estimatedCost.toLocaleString('en-IN')} <span style="font-weight: 400; color: #64748b; font-size: 11px;">(Realtime price detected by AI)</span></td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">Lodgement Timestamp:</td>
            <td style="color: #0f172a;">${hazard.reportedAt || dated}</td>
          </tr>
        </table>
      </div>
    `;

    const bodyParagraphs = [
      `The Autonomous Vision AI Triage Engine has detected, cross-verified, and registered a priority urban infrastructure hazard docketed as <strong>${hazard.id}</strong>. The incident has met dual-pillar verification criteria and necessitates immediate contractor assignment.`,
      `Technical incident metrics and cost predictions are summarized below: ${incidentTable}`,
      `The designated Municipal Administration Authority is requested to access the Command Center at <a href="https://3.6.172.250.nip.io" style="color: #0284c7; font-weight: 700; text-decoration: underline;">https://3.6.172.250.nip.io</a> to approve the automated work order and issue contractor dispatch instructions.`,
      `This issues under the Autonomous Incident Response Framework of the Government of Tamil Nadu.`
    ];

    const html = renderOfficialMemorandumHtml({
      omNumber,
      dated,
      subject,
      reference,
      bodyParagraphs,
      signatoryName: 'K. S. Purushothaman',
      signatoryDesignation: 'Executive Incident Authority',
      signatoryDept: 'Department of Municipal Administration & Urban Water Supply',
      recipientName: 'Municipal Administrator',
      recipientEmail: ADMIN_ALERT_EMAIL
    });

    await transporter.sendMail({
      from,
      sender: SENDER_EMAIL,
      replyTo: hazard.citizenEmail || SENDER_EMAIL,
      envelope: {
        from: SENDER_EMAIL,
        to: ADMIN_ALERT_EMAIL
      },
      to: ADMIN_ALERT_EMAIL,
      subject: `[OFFICIAL MEMORANDUM] No. ${omNumber}: Priority Incident Alert - ${hazard.title}`,
      text: `GOVERNMENT OF TAMIL NADU - OFFICIAL MEMORANDUM (No. ${omNumber})\n\nSub: Priority Incident Alert & Dispatch Directive.\nIncident ID: ${hazard.id}\nTitle: ${hazard.title}\nLocation: ${hazard.location.address} (${hazard.location.ward})\nAi Prediction Budget: ₹${estimatedCost.toLocaleString('en-IN')}\n\nReview at https://3.6.172.250.nip.io`,
      html
    });

    console.log(`[ADMIN-ALERT-SUCCESS] Official Memorandum admin alert dispatched to ${ADMIN_ALERT_EMAIL} for ${hazard.id}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[ADMIN-ALERT-ERROR] Failed to send OM admin alert to ${ADMIN_ALERT_EMAIL}:`, err?.message || err);
    return { success: false, error: err?.message };
  }
}
