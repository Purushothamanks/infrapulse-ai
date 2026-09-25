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
  const from = process.env.SMTP_FROM || `"MyGovt AI Hub" <${user || 'auth@mygovtai.gov'}>`;

  console.log(`[AUTH-OTP] Generated OTP for ${toEmail} (${role}): ${otp}`);

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
    const recipientTitle = recipientName || (isOfficial ? 'Municipal Administrator' : 'Citizen');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Your Secure Verification Code</title>
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
    .otp-box { background: #0f172a; border: 2px dashed #10b981; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #10b981; font-family: 'Courier New', Courier, monospace; }
    .otp-label { font-size: 11px; color: #64748b; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px; }
    .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    .info-table td { padding: 8px 12px; border-bottom: 1px solid #334155; }
    .info-table td:first-child { color: #64748b; font-weight: 600; width: 35%; }
    .info-table td:last-child { color: #f1f5f9; font-family: monospace; }
    .footer { padding: 20px 28px; background: #0f172a; border-top: 1px solid #334155; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="brand">🏛️ MyGovt AI Hub</h1>
      <div class="subbrand">Autonomous Urban Infrastructure & Grievance Portal</div>
    </div>
    <div class="body">
      <div class="badge">${roleBadgeText}</div>
      <div class="greeting">Hello, ${recipientTitle}</div>
      <p class="desc">
        A login verification code was requested for your account on the <strong>MyGovt AI Hub</strong> platform. Use the 6-digit code below to securely verify your identity and complete sign-in.
      </p>

      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-label">One-Time Security Code (Valid for 10 minutes)</div>
      </div>

      <table class="info-table">
        <tr>
          <td>Role</td>
          <td>${isOfficial ? 'Municipal Official (Admin)' : 'Civilian Citizen'}</td>
        </tr>
        <tr>
          <td>Authorized Email</td>
          <td>${toEmail}</td>
        </tr>
        ${officialId ? `<tr><td>Govt Officer ID</td><td>${officialId}</td></tr>` : ''}
        <tr>
          <td>Security Status</td>
          <td>Verified Domain & TLS Encrypted</td>
        </tr>
      </table>

      <p style="font-size: 11px; color: #64748b; margin-top: 24px; line-height: 1.5;">
        🔒 <strong>Security Notice:</strong> If you did not request this verification code, please ignore this email. No access has been granted without entering this OTP.
      </p>
    </div>
    <div class="footer">
      MyGovt AI Hub • Tamil Nadu Urban Infrastructure Division • Secured by Zero-Trust MFA
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: `🏛️ [${otp}] MyGovt AI Hub Secure Verification Code`,
      text: `Your MyGovt AI Hub verification code is: ${otp}. Valid for 10 minutes. Role: ${roleBadgeText}.`,
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
