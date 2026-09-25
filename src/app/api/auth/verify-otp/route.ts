import { NextResponse } from 'next/server';
import { verifyOtpRecord } from '@/lib/otpStore';
import { registerUser } from '@/lib/userStore';
import { User } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, officialId, name } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    if (!cleanEmail || !cleanCode) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required.' },
        { status: 400 }
      );
    }

    const verification = verifyOtpRecord(cleanEmail, cleanCode, officialId);

    if (!verification.valid || !verification.data) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Invalid verification credentials.' },
        { status: 400 }
      );
    }

    const { role, officialId: verifiedOfficialId } = verification.data;

    let user: User;

    if (role === 'admin') {
      user = registerUser({
        id: 'USR-ADM-001',
        name: 'K. S. Purushothaman',
        email: 'purushothamank.s799@gmail.com',
        role: 'admin',
        officialId: verifiedOfficialId || 'TN-SAMPLE-2026',
        verified: true,
        department: 'Tamil Nadu Municipal Administration & Urban Water Supply'
      });
    } else {
      const citizenRawName = (name || verification.data.name || cleanEmail.split('@')[0].replace(/[._]/g, ' '))
        .replace(/commissioner\s*/gi, '')
        .trim();
      user = registerUser({
        id: `USR-CIT-${Math.floor(1000 + Math.random() * 9000)}`,
        name: citizenRawName || 'Civilian Citizen',
        email: cleanEmail,
        role: 'citizen',
        verified: true
      });
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'Email successfully verified! Your account is registered.'
    });
  } catch (error: any) {
    console.error('Error in verify-otp API:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to verify code.' },
      { status: 500 }
    );
  }
}
