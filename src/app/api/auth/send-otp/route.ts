import { NextResponse } from 'next/server';
import { saveOtpRecord } from '@/lib/otpStore';
import { sendOtpEmail } from '@/lib/mailer';

// STRICT ADMIN CREDENTIALS AS SPECIFIED
const AUTHORIZED_ADMIN_EMAIL = 'purushothamank.s799@gmail.com';
const AUTHORIZED_GOVT_ID = 'TN-SAMPLE-2026';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role, officialId, name } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanRole = role === 'admin' ? 'admin' : 'citizen';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Strict Validation for Municipal Admin Role
    if (cleanRole === 'admin') {
      if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        return NextResponse.json(
          {
            success: false,
            error: `Access Denied: Only authorized municipal official (${AUTHORIZED_ADMIN_EMAIL}) is permitted to access the Official Command Center.`
          },
          { status: 403 }
        );
      }

      const cleanOfficialId = (officialId || '').trim();
      if (cleanOfficialId !== AUTHORIZED_GOVT_ID) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid Government Official ID. Authorized ID is required (e.g. ${AUTHORIZED_GOVT_ID}).`
          },
          { status: 403 }
        );
      }
    }

    // 2. Generate and store secure OTP in memory
    const { code, expiresAt } = saveOtpRecord(
      cleanEmail,
      cleanRole,
      name || (cleanRole === 'admin' ? 'K. S. Purushothaman (Chief Municipal Commissioner)' : undefined),
      cleanRole === 'admin' ? AUTHORIZED_GOVT_ID : undefined
    );

    // 3. Dispatch real email via nodemailer / SMTP
    const mailResult = await sendOtpEmail({
      toEmail: cleanEmail,
      otp: code,
      recipientName: name || (cleanRole === 'admin' ? 'K. S. Purushothaman' : undefined),
      role: cleanRole,
      officialId: cleanRole === 'admin' ? AUTHORIZED_GOVT_ID : undefined
    });

    return NextResponse.json({
      success: true,
      emailSent: mailResult.success,
      email: cleanEmail,
      role: cleanRole,
      expiresAt,
      message: mailResult.success
        ? `Security verification code sent to ${cleanEmail}. Please check your inbox (and spam folder).`
        : `Verification code generated for ${cleanEmail}. (SMTP not configured on server, code available below for testing)`,
      // Include devCode when live SMTP is unconfigured to guarantee seamless workflow without lockouts
      devCode: mailResult.success ? undefined : code
    });
  } catch (error: any) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process verification code.' },
      { status: 500 }
    );
  }
}
