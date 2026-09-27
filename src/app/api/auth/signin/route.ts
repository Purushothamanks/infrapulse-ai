import { NextResponse } from 'next/server';
import { getRegisteredUser, registerUser } from '@/lib/userStore';

const AUTHORIZED_ADMIN_EMAILS = ['mygovtaihub@gmail.com'];
const isAuthorizedAdmin = (e: string) => AUTHORIZED_ADMIN_EMAILS.includes((e || '').trim().toLowerCase());

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

    // 1. Municipal Admin Sign In - ALWAYS requires live OTP verification!
    if (selectedRole === 'admin' || isAuthorizedAdmin(cleanEmail)) {
      if (!isAuthorizedAdmin(cleanEmail)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Access Denied: Only authorized municipal officials are permitted to access the Official Command Center. For any issue, reach: mygovtaihub@gmail.com'
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          requiresOtp: true,
          error: 'Official Security Protocol: Municipal Admin access requires live OTP verification every time. Please authenticate using the 6-digit OTP dispatched to your official email.'
        },
        { status: 401 }
      );
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
