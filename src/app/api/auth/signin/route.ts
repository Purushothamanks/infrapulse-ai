import { NextResponse } from 'next/server';
import { getRegisteredUser, registerUser } from '@/lib/userStore';

const AUTHORIZED_ADMIN_EMAIL = 'purushothamank.s799@gmail.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const selectedRole = role === 'admin' ? 'admin' : 'citizen';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Municipal Admin Sign In
    if (selectedRole === 'admin' || cleanEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Access Denied: Only authorized municipal officials are permitted to access the Official Command Center. For any issue , reach : purushothamank.s799@gmail.com'
          },
          { status: 403 }
        );
      }

      const adminUser = getRegisteredUser(cleanEmail) || registerUser({
        email: cleanEmail,
        name: 'K. S. Purushothaman',
        role: 'admin',
        officialId: 'TN-SAMPLE-2026'
      });

      return NextResponse.json({
        success: true,
        user: adminUser,
        message: 'Welcome back, Official K. S. Purushothaman.'
      });
    }

    // 2. Returning Civilian Citizen Sign In
    const existingUser = getRegisteredUser(cleanEmail);
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          notRegistered: true,
          error: "Account not registered yet. Please select the 'Sign Up (1st Time Only)' tab to complete one-time email OTP verification."
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: existingUser,
      message: `Welcome back, ${existingUser.name}.`
    });
  } catch (error: any) {
    console.error('Error in signin API:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to sign in.' },
      { status: 500 }
    );
  }
}
