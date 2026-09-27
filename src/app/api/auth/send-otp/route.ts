import { NextResponse } from 'next/server';
import { saveOtpRecord } from '@/lib/otpStore';
import { sendOtpEmail } from '@/lib/mailer';

const AUTHORIZED_ADMIN_EMAILS = ['mygovtaihub@gmail.com'];
const AUTHORIZED_GOVT_ID = 'TN-SAMPLE-2026';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role, name } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanRole = role === 'admin' ? 'admin' : 'citizen';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Strict Validation for Municipal Admin Email
    if (cleanRole === 'admin') {
      if (!AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Access Denied: Only authorized municipal officials are permitted to access the Official Command Center.'
          },
          { status: 403 }
        );
      }
    }

    // 2. Generate and store secure OTP in memory
    const assignedGovtId = cleanRole === 'admin' ? AUTHORIZED_GOVT_ID : undefined;
    const assignedName = name || (cleanRole === 'admin' ? 'Municipal Admin' : undefined);

    const { code, expiresAt } = saveOtpRecord(
      cleanEmail,
      cleanRole,
      assignedName,
      assignedGovtId
    );

    // 3. Dispatch real email via nodemailer / SMTP
    const mailResult = await sendOtpEmail({
      toEmail: cleanEmail,
      otp: code,
      recipientName: assignedName,
      role: cleanRole,
      officialId: assignedGovtId
    });

    const successMessage = `Verification code sent to ${cleanEmail}. Please check your Inbox and Spam/Junk folder.`;

    return NextResponse.json({
      success: true,
      emailSent: mailResult.success,
      email: cleanEmail,
      role: cleanRole,
      expiresAt,
      message: successMessage
    });
  } catch (error: any) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process verification request.' },
      { status: 500 }
    );
  }
}
