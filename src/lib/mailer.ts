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

/**
 * Common modern, clean CSS styles for executive emails
 */
const EMAIL_BASE_HEAD = `
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #0f172a;
    }
    a { color: #059669; text-decoration: none; }
  </style>
`;

/**
 * 1. Dispatches the Permanent Municipal Security Card to the Admin (only once / on request).
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

  console.log(`[AUTH-CARD] Issuing Permanent Security Card to ${toEmail}: ${cardNumber}`);

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

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  ${EMAIL_BASE_HEAD}
  <title>Official Municipal Security Card</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 580px; margin: 0 auto;">
    <tr>
      <td>
        <!-- Brand Header -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td align="left">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #059669;">
                Government of Tamil Nadu
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.4px; margin-top: 2px;">
                MyGovt AI Hub
              </div>
            </td>
            <td align="right" valign="middle">
              <span style="display: inline-block; padding: 4px 10px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.5px;">
                Official Credential
              </span>
            </td>
          </tr>
        </table>

        <!-- Main Card Container -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04); overflow: hidden; padding: 32px;">
          
          <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
            Dear ${recipientName},
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
            Your official <strong>Permanent Municipal Security Card</strong> has been generated. Use this permanent card number to authenticate into the Municipal Command Center. No OTP will be required.
          </p>

          <!-- DIGITAL SECURITY CARD DISPLAY -->
          <div style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); border: 1px solid #059669; border-radius: 14px; padding: 24px; color: #ffffff; box-shadow: 0 8px 24px rgba(6, 78, 59, 0.25); margin-bottom: 24px;">
            
            <!-- Card Header -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
              <tr>
                <td>
                  <div style="font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #a7f3d0;">
                    TAMIL NADU MUNICIPAL ADMINISTRATION
                  </div>
                  <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-top: 2px;">
                    Permanent Security Access Card
                  </div>
                </td>
                <td align="right" valign="top">
                  <span style="display: inline-block; background-color: rgba(167, 243, 208, 0.15); border: 1px solid rgba(167, 243, 208, 0.4); border-radius: 6px; padding: 3px 8px; font-size: 10px; font-weight: 700; color: #a7f3d0; text-transform: uppercase;">
                    ACTIVE & PERMANENT
                  </span>
                </td>
              </tr>
            </table>

            <!-- Card Number -->
            <div style="background-color: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 20px;">
              <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 6px;">
                MUNICIPAL CARD NUMBER
              </div>
              <div style="font-size: 26px; font-weight: 800; letter-spacing: 4px; color: #6ee7b7; font-family: 'Courier New', Courier, monospace;">
                ${cardNumber}
              </div>
            </div>

            <!-- Card Metadata -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 11px; color: #cbd5e1;">
              <tr>
                <td style="padding: 4px 0; width: 40%; color: #94a3b8;">Issued To:</td>
                <td style="padding: 4px 0; font-weight: 700; color: #ffffff;">${recipientName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #94a3b8;">Authorized Email:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #ffffff; font-family: monospace;">${toEmail}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #94a3b8;">Department:</td>
                <td style="padding: 4px 0; color: #e2e8f0;">${department}</td>
              </tr>
            </table>

          </div>

          <!-- Instruction Callout -->
          <div style="background-color: #f8fafc; border-left: 3px solid #059669; padding: 14px 18px; border-radius: 4px; margin-bottom: 28px;">
            <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
              📌 How to use this card number:
            </div>
            <div style="font-size: 12px; line-height: 1.5; color: #475569;">
              Whenever you log in to the application, select <strong>Admin Official</strong>, enter your official email, and enter this <strong>Card Number</strong>. Keep this card number safe.
            </div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 12px;">
            <a href="https://3.6.172.250.nip.io" style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);">
              Access Municipal Command Center →
            </a>
          </div>

        </div>

        <!-- Minimalist Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6;">
          <tr>
            <td>
              Government of Tamil Nadu • Municipal Administration & Urban Water Supply<br />
              Authorized Support: <a href="mailto:${SENDER_EMAIL}" style="color: #64748b;">${SENDER_EMAIL}</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      sender: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      envelope: {
        from: SENDER_EMAIL,
        to: toEmail
      },
      to: toEmail,
      subject: `🏛️ [Government of Tamil Nadu] Your Permanent Municipal Security Card: ${cardNumber}`,
      text: `Your Permanent Municipal Security Card Number is: ${cardNumber}. Issued to: ${recipientName}. Authorized Email: ${toEmail}. Save this card number for future admin logins.`,
      html
    });

    console.log(`[AUTH-CARD-SUCCESS] Permanent card email dispatched to ${toEmail}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[AUTH-CARD-ERROR] Failed to send card email to ${toEmail}:`, err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * 2. Dispatches an ultra-clean, minimalist OTP verification email for Citizen onboarding.
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

  console.log(`[AUTH-OTP] Generated OTP for ${toEmail} (${role}): ${otp}`);

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
    const recipientTitle = isOfficial ? 'Municipal Administrator' : (recipientName || 'Citizen');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  ${EMAIL_BASE_HEAD}
  <title>Verification Passcode</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 540px; margin: 0 auto;">
    <tr>
      <td>
        <!-- Brand Header -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td align="left">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #059669;">
                Government of Tamil Nadu
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.4px; margin-top: 2px;">
                MyGovt AI Hub
              </div>
            </td>
            <td align="right" valign="middle">
              <span style="display: inline-block; padding: 4px 10px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase;">
                Verification Code
              </span>
            </td>
          </tr>
        </table>

        <!-- White Card -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04); padding: 32px;">
          
          <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
            Hello ${recipientTitle},
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
            Please use the 6-digit verification code below to verify your email address and access MyGovt AI Hub:
          </p>

          <!-- OTP Box -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">
              ONE-TIME VERIFICATION CODE
            </div>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', Courier, monospace;">
              ${otp}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
              Expires in 10 minutes • Do not share with anyone
            </div>
          </div>

          <!-- Account Details -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 40%;">Account Email:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a; font-family: monospace;">${toEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Requested Access:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${isOfficial ? 'Municipal Official' : 'Civilian Citizen'}</td>
            </tr>
          </table>

        </div>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6;">
          <tr>
            <td>
              Government of Tamil Nadu • Municipal Administration & Urban Water Supply<br />
              Authorized Support: <a href="mailto:${SENDER_EMAIL}" style="color: #64748b;">${SENDER_EMAIL}</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      sender: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      envelope: {
        from: SENDER_EMAIL,
        to: toEmail
      },
      to: toEmail,
      subject: `[Government of Tamil Nadu] ${otp} is your verification code`,
      text: `Your verification passcode is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
      html
    });

    console.log(`[AUTH-EMAIL-SUCCESS] OTP email dispatched to ${toEmail}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[AUTH-EMAIL-ERROR] Failed to send OTP email to ${toEmail}:`, err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * 3. Dispatches modern, executive civic grievance status update to the citizen,
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
    const statusText = isCompleted ? 'Completed & Resolved' : 'Work In Progress';
    const statusBadgeBg = isCompleted ? '#ecfdf5' : '#fffbeb';
    const statusBadgeBorder = isCompleted ? '#a7f3d0' : '#fde68a';
    const statusBadgeColor = isCompleted ? '#047857' : '#b45309';

    const subject = isCompleted
      ? `✅ [RESOLVED] Grievance ${hazardId}: ${hazardTitle} - Official Completion Certificate Attached`
      : `🔄 [IN PROGRESS] Grievance ${hazardId}: ${hazardTitle} - Field Crew Dispatched`;

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
          completedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' }),
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

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  ${EMAIL_BASE_HEAD}
  <title>Grievance Status Update</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 580px; margin: 0 auto;">
    <tr>
      <td>
        <!-- Brand Header -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td align="left">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #059669;">
                Government of Tamil Nadu
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.4px; margin-top: 2px;">
                MyGovt AI Hub
              </div>
            </td>
            <td align="right" valign="middle">
              <span style="display: inline-block; padding: 4px 10px; background-color: ${statusBadgeBg}; border: 1px solid ${statusBadgeBorder}; border-radius: 9999px; font-size: 11px; font-weight: 700; color: ${statusBadgeColor}; text-transform: uppercase;">
                ${statusText}
              </span>
            </td>
          </tr>
        </table>

        <!-- Main Card -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04); padding: 32px;">
          
          <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
            Dear ${citizenName || 'Citizen'},
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
            ${isCompleted
              ? `We are pleased to inform you that municipal engineering teams have successfully repaired and resolved your reported defect: <strong>${hazardTitle}</strong>.`
              : `Your reported defect <strong>${hazardTitle}</strong> has been reviewed by municipal engineers and moved to <strong>IN PROGRESS</strong>. Field crews have been assigned.`
            }
          </p>

          ${isCompleted && pdfAttachment ? `
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
            <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 2px;">
              📄 Official Completion Certificate Attached
            </div>
            <div style="font-size: 12px; color: #15803d;">
              The signed Government of Tamil Nadu Completion & Engineering Docket has been attached as a PDF to this email for your records.
            </div>
          </div>
          ` : ''}

          <!-- Incident Dossier Details -->
          <div style="border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; border-collapse: collapse;">
              ${hazardId ? `
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; width: 38%;">Grievance ID</td>
                <td style="padding: 10px 14px; font-weight: 700; color: #0284c7; font-family: monospace;">${hazardId}</td>
              </tr>
              ` : ''}
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Incident Title</td>
                <td style="padding: 10px 14px; font-weight: 600; color: #0f172a;">${hazardTitle}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Location</td>
                <td style="padding: 10px 14px; color: #0f172a;">${locationAddress} (${ward})</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Resolution Status</td>
                <td style="padding: 10px 14px; font-weight: 700; color: ${statusBadgeColor};">${statusText}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Ai Prediction Budget (INR)</td>
                <td style="padding: 10px 14px; font-weight: 700; color: #059669; font-family: monospace;">₹${estimatedCost.toLocaleString('en-IN')} <span style="font-weight: 400; color: #64748b; font-size: 11px;">(Realtime price detected by AI)</span></td>
              </tr>
              ${workOrderId ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Work Order ID</td>
                <td style="padding: 10px 14px; font-family: monospace; color: #0f172a;">${workOrderId}</td>
              </tr>
              ` : ''}
              ${contractorTeam ? `
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Assigned Crew</td>
                <td style="padding: 10px 14px; color: #0f172a;">${contractorTeam}</td>
              </tr>
              ` : ''}
              ${scheduledDispatch ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Dispatch Schedule</td>
                <td style="padding: 10px 14px; color: #0f172a;">${scheduledDispatch}</td>
              </tr>
              ` : ''}
              <tr style="background-color: #f8fafc;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Authorized Officer</td>
                <td style="padding: 10px 14px; color: #0f172a;">K. S. Purushothaman (Municipal Administration)</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0;">
            ${isCompleted
              ? 'Thank you for your active civic participation. Together, we are keeping our roads and infrastructure safe.'
              : 'You will receive another update when field engineering teams complete and certify the work.'
            }
          </p>

        </div>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6;">
          <tr>
            <td>
              Government of Tamil Nadu • Municipal Administration & Urban Water Supply<br />
              Authorized Support: <a href="mailto:${SENDER_EMAIL}" style="color: #64748b;">${SENDER_EMAIL}</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const mailOptions: any = {
      from,
      sender: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      envelope: {
        from: SENDER_EMAIL,
        to: toEmail
      },
      to: toEmail,
      subject,
      text: `Grievance Update: Your reported issue for "${hazardTitle}" is now ${statusText}.${isCompleted ? ' Official Completion PDF Certificate is attached.' : ''}`,
      html
    };

    if (pdfAttachment) {
      mailOptions.attachments = [pdfAttachment];
    }

    await transporter.sendMail(mailOptions);

    console.log(`[STATUS-EMAIL-SUCCESS] Grievance status email sent to ${toEmail} for ${hazardTitle}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[STATUS-EMAIL-ERROR] Failed to send status email to ${toEmail}:`, err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * 4. Immediate Admin Alert Email dispatched to mygovtaihub@gmail.com whenever any citizen posts a new hazard.
 */
export async function sendNewHazardAdminAlertEmail({
  hazard
}: {
  hazard: HazardReport;
}): Promise<{ success: boolean; error?: string }> {
  const { host, port, user, pass, from } = getSmtpConfig();

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

    const isCritical = hazard.urgency === 'CRITICAL';
    const badgeBg = isCritical ? '#fef2f2' : '#fffbeb';
    const badgeBorder = isCritical ? '#fecaca' : '#fde68a';
    const badgeColor = isCritical ? '#991b1b' : '#b45309';
    const estimatedCost = hazard.aiAnalysis?.estimatedCost || 12500;

    const subject = `🚨 [NEW INCIDENT] ${hazard.id}: ${hazard.title} (${hazard.location.ward})`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  ${EMAIL_BASE_HEAD}
  <title>New Incident Alert</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 580px; margin: 0 auto;">
    <tr>
      <td>
        <!-- Brand Header -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td align="left">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #059669;">
                Government of Tamil Nadu
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.4px; margin-top: 2px;">
                MyGovt AI Hub
              </div>
            </td>
            <td align="right" valign="middle">
              <span style="display: inline-block; padding: 4px 10px; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 9999px; font-size: 11px; font-weight: 700; color: ${badgeColor}; text-transform: uppercase;">
                ${hazard.urgency} SEVERITY [${hazard.severity}/100]
              </span>
            </td>
          </tr>
        </table>

        <!-- Main Card -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04); padding: 32px;">
          
          <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
            Municipal Incident Alert
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
            A new urban infrastructure defect has been lodged and verified through the AI triage engine. Contractor dispatch is requested.
          </p>

          <!-- Incident Data -->
          <div style="border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500; width: 38%;">Incident ID</td>
                <td style="padding: 10px 14px; font-weight: 700; color: #0284c7; font-family: monospace;">${hazard.id}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Incident Title</td>
                <td style="padding: 10px 14px; font-weight: 600; color: #0f172a;">${hazard.title}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Category</td>
                <td style="padding: 10px 14px; color: #0f172a;">${hazard.type.toUpperCase().replace('_', ' ')}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Location & Ward</td>
                <td style="padding: 10px 14px; color: #0f172a;">${hazard.location.address} (${hazard.location.ward})</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">GPS Coordinates</td>
                <td style="padding: 10px 14px; font-family: monospace; color: #0f172a;">${hazard.location.lat.toFixed(5)}° N, ${hazard.location.lng.toFixed(5)}° E</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Reporting Citizen</td>
                <td style="padding: 10px 14px; color: #0f172a;">${hazard.citizenName || 'Civilian'} (${hazard.citizenEmail || 'N/A'})</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Ai Prediction Budget (INR)</td>
                <td style="padding: 10px 14px; font-weight: 700; color: #059669; font-family: monospace;">₹${estimatedCost.toLocaleString('en-IN')} <span style="font-weight: 400; color: #64748b; font-size: 11px;">(Realtime price detected by AI)</span></td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-weight: 500;">Lodgement Time</td>
                <td style="padding: 10px 14px; color: #0f172a;">${hazard.reportedAt || 'Just now'}</td>
              </tr>
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center;">
            <a href="https://3.6.172.250.nip.io" style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);">
              Open Command Center & Assign Crew →
            </a>
          </div>

        </div>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6;">
          <tr>
            <td>
              Government of Tamil Nadu • Municipal Administration Command Grid<br />
              Delivered to Designated Municipal Authority: <a href="mailto:${ADMIN_ALERT_EMAIL}" style="color: #64748b;">${ADMIN_ALERT_EMAIL}</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      sender: SENDER_EMAIL,
      replyTo: hazard.citizenEmail || SENDER_EMAIL,
      envelope: {
        from: SENDER_EMAIL,
        to: ADMIN_ALERT_EMAIL
      },
      to: ADMIN_ALERT_EMAIL,
      subject,
      text: `New Hazard Lodged: [${hazard.id}] ${hazard.title} at ${hazard.location.address} (${hazard.location.ward}). Reported by ${hazard.citizenName || 'Citizen'} (${hazard.citizenEmail}). Ai Prediction Budget: ₹${estimatedCost}. Review at https://3.6.172.250.nip.io`,
      html
    });

    console.log(`[ADMIN-ALERT-SUCCESS] New hazard alert email dispatched to ${ADMIN_ALERT_EMAIL} for ${hazard.id}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[ADMIN-ALERT-ERROR] Failed to send admin alert to ${ADMIN_ALERT_EMAIL}:`, err?.message || err);
    return { success: false, error: err?.message };
  }
}
