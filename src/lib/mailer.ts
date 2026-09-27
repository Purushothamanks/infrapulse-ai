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
  const from = process.env.SMTP_FROM || `"MyGovt AI Hub" <${SENDER_EMAIL}>`;

  return { host, port, user, pass, from };
}

interface SendOtpParams {
  toEmail: string;
  otp: string;
  recipientName?: string;
  role: 'admin' | 'citizen';
  officialId?: string;
}

/**
 * Dispatches an ultra-professional, official Government of Tamil Nadu OTP authentication email.
 */
export async function sendOtpEmail({
  toEmail,
  otp,
  recipientName,
  role,
  officialId
}: SendOtpParams): Promise<{ success: boolean; error?: string }> {
  const { host, port, user, pass, from } = getSmtpConfig();

  console.log(`[AUTH-OTP] Generated OTP for ${toEmail} (${role}): ${otp}, Official ID: ${officialId || 'N/A'}`);

  if (!user || !pass) {
    console.warn(
      `[AUTH-EMAIL-WARN] SMTP credentials not set. Set SMTP_USER and SMTP_PASS in .env.local to dispatch live emails.`
    );
    return {
      success: false,
      error: 'SMTP_NOT_CONFIGURED'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const isOfficial = role === 'admin';
    const roleBadgeText = isOfficial
      ? 'Official Municipal Administration Access'
      : 'Civilian Citizen Portal Access';
    const recipientTitle = isOfficial ? 'Municipal Administrator' : (recipientName || 'Citizen');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>One-Time Verification Passcode</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin: 0 auto;">
          
          <!-- Government Header -->
          <tr>
            <td style="background-color: #064e3b; padding: 24px 32px; border-bottom: 3px solid #047857;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                      GOVERNMENT OF TAMIL NADU
                    </div>
                    <div style="font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; line-height: 1.3;">
                      Municipal Administration & Urban Water Supply
                    </div>
                    <div style="font-size: 12px; color: #d1fae5; margin-top: 4px; font-weight: 500;">
                      MyGovt AI Hub • Identity & Security Gateway
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <!-- Role Badge -->
              <div style="display: inline-block; padding: 4px 12px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; font-size: 11px; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px;">
                ${roleBadgeText}
              </div>

              <!-- Salutation -->
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
                Dear ${recipientTitle},
              </div>

              <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                A sign-in request was initiated for your registered account. Please use the official 6-digit One-Time Passcode (OTP) below to authenticate your session:
              </p>

              <!-- Monospace OTP Box -->
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 22px; text-align: center; margin: 20px 0;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                  Official One-Time Passcode (OTP)
                </div>
                <div style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #0f172a; font-family: 'Courier New', Courier, monospace; margin: 4px 0;">
                  ${otp}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
                  ⏱️ Passcode expires in <strong>10 minutes</strong>.
                </div>
              </div>

              <!-- Security Information Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 24px; font-size: 12px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; width: 40%;">Account Email</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-family: monospace;">${toEmail}</td>
                </tr>
                ${officialId ? `
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Government Official ID</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-family: monospace; font-weight: 700;">${officialId}</td>
                </tr>
                ` : ''}
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Authorized Role</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${isOfficial ? 'Municipal Administrator (TN Municipal Administration)' : 'Civilian Citizen Access'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #64748b; font-weight: 600;">Security Notice</td>
                  <td style="padding: 10px 14px; color: #b91c1c; font-weight: 600;">Do not share this code with anyone under any circumstances.</td>
                </tr>
              </table>

              <p style="font-size: 11px; color: #64748b; line-height: 1.5; margin-top: 24px; margin-bottom: 0;">
                If you did not initiate this authentication request, please report it immediately to the municipal cyber desk at <a href="mailto:mygovtaihub@gmail.com" style="color: #047857; text-decoration: none;">mygovtaihub@gmail.com</a>.
              </p>
            </td>
          </tr>

          <!-- Government Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 11px; color: #64748b; line-height: 1.5;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <strong>Government of Tamil Nadu</strong> • Municipal Administration & Urban Water Supply<br />
                    Ezhilagam Complex, Chepauk, Chennai - 600005, Tamil Nadu, India<br />
                    Authorized Support: <a href="mailto:mygovtaihub@gmail.com" style="color: #047857; text-decoration: none;">mygovtaihub@gmail.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 10px; color: #94a3b8; font-size: 10px;">
                    This is an automated municipal security notification generated by MyGovt AI Hub.
                  </td>
                </tr>
              </table>
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
      to: toEmail,
      replyTo: SENDER_EMAIL,
      subject: `[Government of Tamil Nadu] ${otp} is your MyGovt AI Hub verification passcode`,
      text: `Your Government of Tamil Nadu verification passcode is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
      html
    });

    console.log(`[AUTH-EMAIL-SUCCESS] OTP email dispatched to ${toEmail}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[AUTH-EMAIL-ERROR] Failed to send email to ${toEmail}:`, err?.message || err);
    return { success: false, error: err?.message };
  }
}

interface SendGrievanceStatusParams {
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
}

/**
 * Dispatches an ultra-professional civic grievance status update to the citizen,
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
}: SendGrievanceStatusParams): Promise<{ success: boolean; error?: string }> {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!user || !pass) {
    console.warn(`[STATUS-EMAIL-WARN] SMTP credentials not set. Skipping live email.`);
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
    const statusBadgeBg = isCompleted ? '#ecfdf5' : '#f0fdfa';
    const statusBadgeBorder = isCompleted ? '#a7f3d0' : '#99f6e4';
    const statusBadgeColor = isCompleted ? '#065f46' : '#0f766e';

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
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Civic Grievance Status Update</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin: 0 auto;">
          
          <!-- Government Header -->
          <tr>
            <td style="background-color: #064e3b; padding: 24px 32px; border-bottom: 3px solid #047857;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                      GOVERNMENT OF TAMIL NADU
                    </div>
                    <div style="font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; line-height: 1.3;">
                      Municipal Administration & Urban Water Supply
                    </div>
                    <div style="font-size: 12px; color: #d1fae5; margin-top: 4px; font-weight: 500;">
                      MyGovt AI Hub • Public Grievance Redressal Service
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <!-- Status Badge -->
              <div style="display: inline-block; padding: 4px 12px; background-color: ${statusBadgeBg}; border: 1px solid ${statusBadgeBorder}; border-radius: 4px; font-size: 11px; font-weight: 700; color: ${statusBadgeColor}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px;">
                ${statusText}
              </div>

              <!-- Salutation -->
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
                Dear ${citizenName || 'Citizen'},
              </div>

              <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                ${isCompleted
                  ? `We are pleased to inform you that municipal maintenance crews have successfully completed all necessary engineering repair works for your reported defect: <strong>${hazardTitle}</strong>.`
                  : `Your reported infrastructure defect for <strong>${hazardTitle}</strong> has been reviewed by the municipal engineers and transitioned to <strong>IN PROGRESS</strong>. Field crews have been assigned.`
                }
              </p>

              <!-- Official Certificate Callout (if completed) -->
              ${isCompleted && pdfAttachment ? `
              <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 14px 18px; margin: 20px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="28" valign="middle" style="font-size: 18px;">📄</td>
                    <td valign="middle" style="font-size: 13px; color: #166534; font-weight: 600;">
                      Official Quality Assurance Certificate Attached:
                      <span style="font-weight: 400; color: #15803d; display: block; font-size: 12px; margin-top: 2px;">
                        The official Government of Tamil Nadu Completion & Engineering Quality Docket is attached as a PDF to this email.
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              ` : ''}

              <!-- Grievance Dossier Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 20px; font-size: 12px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                ${hazardId ? `
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; width: 40%;">Grievance ID</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-family: monospace; font-weight: 700;">${hazardId}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Incident Title</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${hazardTitle}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Location</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${locationAddress} (${ward})</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Resolution Status</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: ${statusBadgeColor}; font-weight: 700;">${statusText}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Ai Prediction Budget (INR)</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #047857; font-family: monospace; font-weight: 700;">₹${estimatedCost.toLocaleString('en-IN')} <span style="font-weight: 400; color: #64748b; font-size: 11px;">(Realtime price detected by AI)</span></td>
                </tr>
                ${workOrderId ? `
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Official Work Order</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-family: monospace;">${workOrderId}</td>
                </tr>
                ` : ''}
                ${contractorTeam ? `
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Assigned Contractor</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${contractorTeam}</td>
                </tr>
                ` : ''}
                ${scheduledDispatch ? `
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Dispatch Window</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${scheduledDispatch}</td>
                </tr>
                ` : ''}
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; color: #64748b; font-weight: 600;">Certifying Officer</td>
                  <td style="padding: 10px 14px; color: #0f172a;">K. S. Purushothaman (Municipal Administration)</td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 24px; margin-bottom: 0;">
                ${isCompleted
                  ? 'Thank you for participating in civic governance and helping maintain urban infrastructure.'
                  : 'You will receive another update along with the official completion certificate once repair works are certified by field supervisors.'
                }
              </p>
            </td>
          </tr>

          <!-- Government Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 11px; color: #64748b; line-height: 1.5;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <strong>Government of Tamil Nadu</strong> • Municipal Administration & Urban Water Supply<br />
                    Ezhilagam Complex, Chepauk, Chennai - 600005, Tamil Nadu, India<br />
                    Grievance Inquiries: <a href="mailto:mygovtaihub@gmail.com" style="color: #047857; text-decoration: none;">mygovtaihub@gmail.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 10px; color: #94a3b8; font-size: 10px;">
                    This is an automated municipal dispatch notification generated by MyGovt AI Hub.
                  </td>
                </tr>
              </table>
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
      to: toEmail,
      replyTo: SENDER_EMAIL,
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
 * Immediate Admin Alert Email dispatched to mygovtaihub@gmail.com whenever any citizen posts a new hazard.
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
    const badgeColor = isCritical ? '#991b1b' : '#92400e';
    const estimatedCost = hazard.aiAnalysis?.estimatedCost || 12500;

    const subject = `🚨 [URGENT DISPATCH] ${hazard.id}: ${hazard.title} (${hazard.location.ward})`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Incident Reported</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin: 0 auto;">
          
          <!-- Government Header -->
          <tr>
            <td style="background-color: #064e3b; padding: 24px 32px; border-bottom: 3px solid #047857;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                      GOVERNMENT OF TAMIL NADU
                    </div>
                    <div style="font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; line-height: 1.3;">
                      Municipal Command Center • Incident Ingestion Grid
                    </div>
                    <div style="font-size: 12px; color: #d1fae5; margin-top: 4px; font-weight: 500;">
                      MyGovt AI Hub • Autonomous Civil Triage Service
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <!-- Severity Badge -->
              <div style="display: inline-block; padding: 4px 12px; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 4px; font-size: 11px; font-weight: 700; color: ${badgeColor}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px;">
                ${hazard.urgency} SEVERITY [${hazard.severity}/100]
              </div>

              <!-- Salutation -->
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
                Municipal Administrator Alert
              </div>

              <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                An infrastructure defect has just been registered via the Citizen Portal and successfully passed dual-pillar AI verification. Contractor assignment and work order dispatch are required.
              </p>

              <!-- Incident Data Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 15px; font-size: 12px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; width: 40%;">Incident ID</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-family: monospace; font-weight: 700;">${hazard.id}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Incident Title</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${hazard.title}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Category</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${hazard.type.toUpperCase().replace('_', ' ')}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Location Address</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${hazard.location.address}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Municipal Ward</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${hazard.location.ward}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">GPS Coordinates</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-family: monospace;">${hazard.location.lat.toFixed(5)}° N, ${hazard.location.lng.toFixed(5)}° E</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Reporting Citizen</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${hazard.citizenName || 'Civilian'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Citizen Email</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-family: monospace;">${hazard.citizenEmail || 'citizen@gmail.com'}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Ai Prediction Budget (INR)</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #047857; font-family: monospace; font-weight: 700;">₹${estimatedCost.toLocaleString('en-IN')} <span style="font-weight: 400; color: #64748b; font-size: 11px;">(Realtime price detected by AI)</span></td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #64748b; font-weight: 600;">Lodgement Timestamp</td>
                  <td style="padding: 10px 14px; color: #0f172a;">${hazard.reportedAt || 'Just now'}</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 28px; margin-bottom: 10px;">
                <a href="https://3.6.172.250.nip.io" style="background-color: #047857; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 13px; display: inline-block;">
                  Open Command Center & Dispatch Work Order
                </a>
              </div>
            </td>
          </tr>

          <!-- Government Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 11px; color: #64748b; line-height: 1.5;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <strong>Government of Tamil Nadu</strong> • Municipal Administration & Urban Water Supply<br />
                    Delivered to Designated Municipal Administration Authority: <a href="mailto:${ADMIN_ALERT_EMAIL}" style="color: #047857; text-decoration: none;">${ADMIN_ALERT_EMAIL}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 10px; color: #94a3b8; font-size: 10px;">
                    This is an automated priority dispatch alert generated by MyGovt AI Hub Autonomous Grid.
                  </td>
                </tr>
              </table>
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
      to: ADMIN_ALERT_EMAIL,
      replyTo: hazard.citizenEmail || SENDER_EMAIL,
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
