/**
 * Standard Government of Tamil Nadu Official Memorandum (OM) Email HTML Generator
 * Works seamlessly in both browser (client-side) and Node.js environments.
 */

export function getFormattedIndianDate(): string {
  try {
    return new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (_) {
    return '14 October, 2026';
  }
}

export function renderOfficialMemorandumHtml({
  omNumber,
  dated,
  subject,
  reference,
  bodyParagraphs,
  signatoryName = 'Municipal Administration Authority',
  signatoryDesignation = 'Executive Authentication Authority',
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
  signatoryName?: string;
  signatoryDesignation?: string;
  signatoryDept?: string;
  recipientName: string;
  recipientEmail: string;
  copyToList?: string[];
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Official Memorandum - ${omNumber}</title>
  <style>
    body { margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: 'Times New Roman', Times, Georgia, serif; color: #0f172a; }
    p { margin: 0 0 14px 0; line-height: 1.7; text-align: justify; }
    table { border-collapse: collapse; }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: 'Times New Roman', Times, Georgia, serif; color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 640px; margin: 0 auto;">
    <tr>
      <td>
        <div style="background-color: #ffffff; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); padding: 36px 32px; border-radius: 4px;">
          
          <!-- Government Header -->
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

          <!-- Metadata Grid -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px; font-size: 13px;">
            <tr>
              <td align="left" style="vertical-align: top; width: 60%; color: #334155;">
                <strong>Memo No:</strong> <span style="font-family: 'Courier New', Courier, monospace; font-weight: 700; color: #0f172a;">${omNumber}</span>
              </td>
              <td align="right" style="vertical-align: top; width: 40%; color: #334155;">
                <strong>Dated:</strong> ${dated}
              </td>
            </tr>
          </table>

          <!-- Heading -->
          <div style="text-align: center; margin: 18px 0; padding: 6px 0;">
            <span style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #0f172a; padding-bottom: 2px;">
              OFFICIAL MEMORANDUM
            </span>
          </div>

          <!-- Subject & Reference -->
          <div style="background-color: #f8fafc; border-left: 3px solid #047857; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
            <div style="margin-bottom: 6px;">
              <strong style="color: #0f172a;">SUB:</strong> <span style="color: #1e293b;">${subject}</span>
            </div>
            ${reference ? `<div><strong style="color: #0f172a;">REF:</strong> <span style="color: #475569; font-style: italic;">${reference}</span></div>` : ''}
          </div>

          <!-- Body Paragraphs -->
          <div style="font-size: 14px; line-height: 1.75; color: #1e293b; margin-bottom: 28px;">
            ${bodyParagraphs.map(p => `<p>${p}</p>`).join('')}
          </div>

          <!-- Signatory Block -->
          <div style="margin-top: 32px; margin-bottom: 28px; text-align: right;">
            <div style="display: inline-block; text-align: left; min-width: 240px; border-top: 1px dotted #94a3b8; padding-top: 8px;">
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
                ${signatoryName}
              </div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">
                ${signatoryDesignation}
              </div>
              <div style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 1px;">
                ${signatoryDept}
              </div>
            </div>
          </div>

          <!-- Distribution / Endorsement Block -->
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
</html>`;
}

export function renderAdminCardOmHtml({
  toEmail,
  recipientName = 'Municipal Admin',
  cardNumber,
  omNumber = `MAWS/OM/2026/SEC-${Math.floor(1000 + Math.random() * 9000)}`
}: {
  toEmail: string;
  recipientName?: string;
  cardNumber: string;
  omNumber?: string;
}): string {
  const dated = getFormattedIndianDate();
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
          <td style="color: #0f172a;">Tamil Nadu Municipal Administration &amp; Urban Water Supply</td>
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

  return renderOfficialMemorandumHtml({
    omNumber,
    dated,
    subject,
    reference,
    bodyParagraphs,
    recipientName,
    recipientEmail: toEmail
  });
}

export function renderOtpOmHtml({
  toEmail,
  otp,
  recipientName = 'Citizen Applicant',
  omNumber = `MAWS/OM/2026/OTP-${Math.floor(1000 + Math.random() * 9000)}`
}: {
  toEmail: string;
  otp: string;
  recipientName?: string;
  omNumber?: string;
}): string {
  const dated = getFormattedIndianDate();
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
    `The undersigned is directed to communicate the official One-Time Passcode (OTP) requisitioned for authentication and identity verification on the MyGovt AI Hub portal for <strong>${recipientName}</strong>.`,
    `The official authentication credentials are provided as follows: ${otpBox}`,
    `The recipient is informed that this verification passcode is strictly personal, non-transferable, and shall expire automatically in ten (10) minutes from dispatch. Under no circumstances should this code be disclosed to any unauthorized individual.`,
    `This issues under the Digital Identity and Civic Service Protocol of the Government of Tamil Nadu.`
  ];

  return renderOfficialMemorandumHtml({
    omNumber,
    dated,
    subject,
    reference,
    bodyParagraphs,
    recipientName,
    recipientEmail: toEmail
  });
}
