import nodemailer from 'nodemailer';

interface SendOtpParams {
  toEmail: string;
  otp: string;
  recipientName?: string;
  role: 'admin' | 'citizen';
  officialId?: string;
}

export async function sendOtpEmail({
  toEmail,
  otp,
  recipientName,
  role,
  officialId
}: SendOtpParams): Promise<{ success: boolean; error?: string }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;
  const from = process.env.SMTP_FROM || `"MyGovt AI Hub" <${user || 'purushothamank.s799@gmail.com'}>`;

  console.log(`[AUTH-OTP] Generated OTP for ${toEmail} (${role}): ${otp}, Official ID: ${officialId || 'N/A'}`);

  if (!user || !pass) {
    console.warn(
      `[AUTH-EMAIL-WARN] SMTP credentials not set. Set SMTP_USER and SMTP_PASS (or GMAIL_USER and GMAIL_APP_PASS) in .env.local to dispatch live emails.`
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
      auth: {
        user,
        pass
      }
    });

    const isOfficial = role === 'admin';
    const roleBadgeText = isOfficial ? 'Official Municipal Administrator' : 'Civilian Citizen Access';
    const recipientTitle = recipientName || (isOfficial ? 'K. S. Purushothaman' : 'Citizen');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Your Secure Verification Code & Credentials</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #f8fafc; }
    .card { max-width: 520px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #059669, #0d9488); padding: 28px 24px; text-align: center; }
    .brand { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
    .subbrand { font-size: 12px; color: #ccfbf1; margin-top: 4px; font-family: monospace; }
    .body { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: ${isOfficial ? '#ef4444' : '#10b981'}; color: #ffffff; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
    .greeting { font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 8px; }
    .desc { font-size: 13px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
    
    .credential-box { background: #0f172a; border: 2px dashed #10b981; border-radius: 16px; padding: 20px; text-align: center; margin: 18px 0; }
    .otp-code { font-size: 34px; font-weight: 900; letter-spacing: 6px; color: #10b981; font-family: 'Courier New', Courier, monospace; }
    .credential-label { font-size: 11px; color: #94a3b8; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    
    .gov-id-box { background: #0f172a; border: 2px dashed #38bdf8; border-radius: 16px; padding: 18px; text-align: center; margin: 18px 0; }
    .gov-id-code { font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #38bdf8; font-family: 'Courier New', Courier, monospace; }

    .instructions { background: #1e1b4b; border: 1px solid #4338ca; border-radius: 12px; padding: 14px 16px; margin: 20px 0; font-size: 12px; color: #c7d2fe; line-height: 1.5; }

    .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    .info-table td { padding: 8px 12px; border-bottom: 1px solid #334155; }
    .info-table td:first-child { color: #64748b; font-weight: 600; width: 40%; }
    .info-table td:last-child { color: #f1f5f9; font-family: monospace; }
    .footer { padding: 20px 28px; background: #0f172a; border-top: 1px solid #334155; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="brand">🏛️ MyGovt AI Hub</h1>
      <div class="subbrand">Autonomous Urban Infrastructure & Civic Action Portal</div>
    </div>
    <div class="body">
      <div class="badge">${roleBadgeText}</div>
      <div class="greeting">Hello, ${recipientTitle}</div>
      <p class="desc">
        ${isOfficial
          ? 'An official municipal login verification was requested for your administrator account. Use the verification OTP and Government Official ID number below to complete your authentication.'
          : 'A login verification code was requested for your citizen account. Use the 6-digit OTP code below to access the Citizen Grievance Portal.'
        }
      </p>

      <!-- Primary OTP Box -->
      <div class="credential-box">
        <div class="otp-code">${otp}</div>
        <div class="credential-label">One-Time Security Verification Code (OTP)</div>
      </div>

      <!-- Government Official ID (Only for Admin) -->
      ${isOfficial && officialId ? `
      <div class="gov-id-box">
        <div class="gov-id-code">${officialId}</div>
        <div class="credential-label" style="color: #7dd3fc;">Government Official ID Number</div>
      </div>
      <div class="instructions">
        👉 <strong>Action Required:</strong> Enter both the <strong>6-digit OTP</strong> (<code>${otp}</code>) and your <strong>Government Official ID</strong> (<code>${officialId}</code>) on the verification screen to unlock the Admin Command Center.
      </div>
      ` : `
      <div class="instructions" style="background: #064e3b; border-color: #059669; color: #a7f3d0;">
        👉 <strong>Action Required:</strong> Enter the <strong>6-digit OTP</strong> (<code>${otp}</code>) on the verification screen to access the Citizen Grievance Desk.
      </div>
      `}

      <table class="info-table">
        <tr>
          <td>Access Track</td>
          <td>${isOfficial ? 'Municipal Official Command Center' : 'Civilian Citizen Grievance Desk'}</td>
        </tr>
        <tr>
          <td>Authorized Email</td>
          <td>${toEmail}</td>
        </tr>
        ${officialId ? `<tr><td>Assigned Govt ID</td><td>${officialId}</td></tr>` : ''}
        <tr>
          <td>Validity Period</td>
          <td>10 Minutes</td>
        </tr>
        <tr>
          <td>Security Protocol</td>
          <td>TLS 1.3 End-to-End Encrypted MFA</td>
        </tr>
      </table>

      <p style="font-size: 11px; color: #64748b; margin-top: 24px; line-height: 1.5;">
        🔒 <strong>Security Notice:</strong> If you did not initiate this sign-in request, please disregard this email. Unauthorized access attempts are monitored and recorded.
      </p>
    </div>
    <div class="footer">
      MyGovt AI Hub • Government of Tamil Nadu & Municipal Administration • Secured MFA
    </div>
  </div>
</body>
</html>
    `;

    const subject = isOfficial
      ? `🏛️ [${otp}] Official Verification Code & Govt ID: ${officialId || 'TN-SAMPLE-2026'}`
      : `🏛️ [${otp}] MyGovt AI Hub Citizen Verification Code`;

    await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      text: isOfficial
        ? `Your MyGovt AI Hub verification OTP is: ${otp}. Your Government Official ID is: ${officialId || 'TN-SAMPLE-2026'}. Valid for 10 minutes.`
        : `Your MyGovt AI Hub verification OTP is: ${otp}. Valid for 10 minutes.`,
      html
    });

    console.log(`[AUTH-EMAIL-SUCCESS] Verification email successfully sent to ${toEmail}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[AUTH-EMAIL-ERROR] Failed to send email to ${toEmail}:`, err?.message || err);
    return {
      success: false,
      error: err?.message || 'Failed to dispatch email'
    };
  }
}

export interface GrievanceStatusEmailParams {
  toEmail: string;
  hazardId?: string;
  citizenName?: string;
  hazardTitle: string;
  newStatus: string;
  locationAddress: string;
  ward: string;
  contractorTeam?: string;
  scheduledDispatch?: string;
  workOrderId?: string;
}

export async function sendGrievanceStatusEmail({
  toEmail,
  hazardId,
  citizenName,
  hazardTitle,
  newStatus,
  locationAddress,
  ward,
  contractorTeam,
  scheduledDispatch,
  workOrderId
}: GrievanceStatusEmailParams): Promise<{ success: boolean; error?: string }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;
  const from = process.env.SMTP_FROM || `"MyGovt AI Hub" <${user || 'purushothamank.s799@gmail.com'}>`;

  if (!toEmail || !toEmail.includes('@')) {
    return { success: false, error: 'Invalid recipient email' };
  }

  if (!user || !pass) {
    console.warn('[STATUS-EMAIL-WARN] SMTP not configured. Skipping status email dispatch.');
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const isCompleted = newStatus.toLowerCase().includes('complete') || newStatus.toLowerCase().includes('resolve');
    const statusBadgeColor = isCompleted ? '#10b981' : '#f59e0b';
    const statusText = isCompleted ? 'COMPLETED & RESOLVED' : 'IN PROGRESS / DISPATCHED';
    const subject = isCompleted
      ? `🏛️ [Resolved] Your civic grievance for "${hazardTitle}" has been Completed`
      : `🏛️ [In Progress] Repair crews mobilized for "${hazardTitle}"`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Civic Grievance Status Update</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #f8fafc; }
    .card { max-width: 520px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #059669, #0d9488); padding: 24px; text-align: center; }
    .brand { font-size: 18px; font-weight: 800; color: #ffffff; margin: 0; }
    .subbrand { font-size: 11px; color: #ccfbf1; margin-top: 4px; font-family: monospace; }
    .body { padding: 28px 24px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: ${statusBadgeColor}; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
    .greeting { font-size: 15px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
    .desc { font-size: 13px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px; }
    .status-card { background: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 16px; margin: 18px 0; }
    .info-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .info-table td { padding: 8px 10px; border-bottom: 1px solid #334155; }
    .info-table td:first-child { color: #94a3b8; font-weight: 600; width: 35%; }
    .info-table td:last-child { color: #f1f5f9; }
    .footer { padding: 16px 24px; background: #0f172a; border-top: 1px solid #334155; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="brand">🏛️ MyGovt AI Hub</h1>
      <div class="subbrand">Civic Grievance Real-Time Tracking Notification</div>
    </div>
    <div class="body">
      <div class="badge">${statusText}</div>
      <div class="greeting">Hello, ${citizenName || 'Civic Scout'}</div>
      <p class="desc">
        ${isCompleted
          ? `Great news! The municipal maintenance fleet has successfully completed the repair works for your reported grievance: <strong>${hazardTitle}</strong>.`
          : `The municipal administration has reviewed your report for <strong>${hazardTitle}</strong> and marked it as <strong>IN PROGRESS</strong>. Repair operations are actively underway.`
        }
      </p>

      <div class="status-card">
        <table class="info-table">
          ${hazardId ? `<tr><td>Grievance ID</td><td style="font-family: monospace; font-weight: bold; color: #38bdf8;">${hazardId}</td></tr>` : ''}
          <tr>
            <td>Incident Title</td>
            <td><strong>${hazardTitle}</strong></td>
          </tr>
          <tr>
            <td>Location</td>
            <td>${locationAddress} (${ward})</td>
          </tr>
          <tr>
            <td>Updated Status</td>
            <td><strong style="color: ${statusBadgeColor};">${statusText}</strong></td>
          </tr>
          ${workOrderId ? `<tr><td>Official Work Order</td><td style="font-family: monospace;">${workOrderId}</td></tr>` : ''}
          ${contractorTeam ? `<tr><td>Assigned Contractor</td><td>${contractorTeam}</td></tr>` : ''}
          ${scheduledDispatch ? `<tr><td>SLA Dispatch Window</td><td>${scheduledDispatch}</td></tr>` : ''}
          <tr>
            <td>Authorized Officer</td>
            <td>K. S. Purushothaman (Municipal Administration)</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
        ${isCompleted
          ? '🌟 Thank you for keeping our city safe and sustainable by reporting urban defects!'
          : '📡 You will receive another notification once the field crew certifies completion.'
        }
      </p>
    </div>
    <div class="footer">
      MyGovt AI Hub • Tamil Nadu Municipal Administration & Urban Water Supply
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      text: `Grievance Update: Your reported issue for "${hazardTitle}" is now ${statusText}.`,
      html
    });

    console.log(`[STATUS-EMAIL-SUCCESS] Grievance status update email sent to ${toEmail} for ${hazardTitle}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[STATUS-EMAIL-ERROR] Failed to send status email to ${toEmail}:`, err?.message || err);
    return { success: false, error: err?.message };
  }
}
