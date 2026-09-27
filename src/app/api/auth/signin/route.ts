import { NextResponse } from 'next/server';
import { getRegisteredUser, issueAdminCardNumber, verifyAdminCardNumber } from '@/lib/userStore';
import { sendAdminSecurityCardEmail } from '@/lib/mailer';

const AUTHORIZED_ADMIN_EMAILS = ['mygovtaihub@gmail.com'];
const isAuthorizedAdmin = (e: string) => AUTHORIZED_ADMIN_EMAILS.includes((e || '').trim().toLowerCase());

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role, cardNumber, action } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const selectedRole = role === 'admin' ? 'admin' : 'citizen';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Municipal Admin Operations (Permanent Card Authentication)
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

      // 1A. Admin requests 1st-time Card issuance or resending card
      if (action === 'issue_card') {
        const { cardNumber: issuedCard, isNew, user } = issueAdminCardNumber(cleanEmail, 'K. S. Purushothaman');

        // Dispatch official security card email
        await sendAdminSecurityCardEmail({
          toEmail: cleanEmail,
          recipientName: user.name,
          cardNumber: issuedCard,
          department: user.department
        });

        return NextResponse.json({
          success: true,
          cardIssued: true,
          isNew,
          message: isNew
            ? `Your Permanent Municipal Security Card Number has been generated and sent to ${cleanEmail}. Please enter your card number to log in.`
            : `Your Permanent Municipal Security Card Number has been resent to ${cleanEmail}. Please enter your card number to log in.`
        });
      }

      // 1B. Admin Login via Permanent Card Number
      if (!cardNumber || !cardNumber.trim()) {
        return NextResponse.json(
          {
            success: false,
            requiresCard: true,
            error: 'Please enter your Permanent Municipal Security Card Number to log in. If this is your first time, click "Issue My Permanent Security Card".'
          },
          { status: 400 }
        );
      }

      const verification = verifyAdminCardNumber(cleanEmail, cardNumber.trim());

      if (!verification.valid || !verification.user) {
        return NextResponse.json(
          {
            success: false,
            error: verification.error || 'Invalid Municipal Security Card Number.'
          },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: verification.user,
        message: `Welcome back, ${verification.user.name}.`
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
