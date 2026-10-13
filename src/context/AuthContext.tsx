'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { renderAdminCardOmHtml, renderOtpOmHtml } from '@/lib/omEmailTemplate';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (
    email: string,
    role?: UserRole,
    cardNumber?: string
  ) => Promise<{
    success: boolean;
    user?: User;
    notRegistered?: boolean;
    requiresCard?: boolean;
    cardIssued?: boolean;
    message?: string;
    error?: string;
  }>;
  issueAdminCard: (
    email: string
  ) => Promise<{
    success: boolean;
    cardIssued?: boolean;
    isNew?: boolean;
    message?: string;
    error?: string;
  }>;
  requestOtp: (
    email: string,
    role: UserRole,
    name?: string
  ) => Promise<{
    success: boolean;
    emailSent?: boolean;
    message?: string;
    error?: string;
  }>;
  verifyOtpAndLogin: (
    email: string,
    code: string,
    officialId?: string,
    name?: string
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
}

const AUTHORIZED_ADMIN_EMAILS = ['mygovtaihub@gmail.com'];
const isAuthorizedAdmin = (e: string) => AUTHORIZED_ADMIN_EMAILS.includes((e || '').trim().toLowerCase());
const normalizeCard = (s: string) => (s || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from localStorage
    try {
      const stored = localStorage.getItem('mygovtai_session_user') || localStorage.getItem('infrapulse_session_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          if (parsed.name) {
            parsed.name = parsed.name.replace(/commissioner\s*/gi, '').trim();
          }
          setUser(parsed);
        }
      }
    } catch (_) {}
    setIsLoading(false);
  }, []);

  /**
   * 1. Issue or Resend Admin Municipal Security Access Card
   * The card number is strictly dispatched via email and NEVER shown in the response message.
   */
  const issueAdminCard = async (
    email: string
  ): Promise<{
    success: boolean;
    cardIssued?: boolean;
    isNew?: boolean;
    message?: string;
    error?: string;
  }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isAuthorizedAdmin(cleanEmail)) {
      return {
        success: false,
        error: 'Access Denied: Only authorized municipal officials are permitted to receive an Official Security Access Card.'
      };
    }

    // 1A. Try API route first (Node.js server)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, role: 'admin', action: 'issue_card' })
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.success) {
          return {
            success: true,
            cardIssued: true,
            isNew: data.isNew,
            message: data.message
          };
        }
      }
    } catch (_) {}

    // 1B. Supabase Realtime Fallback (Firebase Static Hosting & Universal Cross-Device)
    try {
      // Check if card already exists in Supabase
      const { data: existingCard } = await supabase
        .from('admin_security_cards')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      let assignedCard: string;
      let isNew = false;

      if (existingCard && existingCard.card_number) {
        assignedCard = existingCard.card_number;
      } else {
        const part1 = Math.floor(1000 + Math.random() * 9000).toString();
        const part2 = Math.floor(1000 + Math.random() * 9000).toString();
        assignedCard = `TN-MUNI-${part1}-${part2}`;
        isNew = true;

        await supabase.from('admin_security_cards').upsert([
          {
            email: cleanEmail,
            card_number: assignedCard,
            name: 'Municipal Admin',
            department: 'Tamil Nadu Municipal Administration & Urban Water Supply'
          }
        ]);
      }

      // Enqueue official memorandum email into Supabase mail queue
      const emailHtml = renderAdminCardOmHtml({
        toEmail: cleanEmail,
        recipientName: 'Municipal Admin',
        cardNumber: assignedCard
      });

      await supabase.from('mail_queue').insert([
        {
          to_email: cleanEmail,
          subject: 'MUNICIPAL COMMAND CENTER — ALLOCATION AND ISSUANCE OF PERMANENT MUNICIPAL SECURITY ACCESS CARD.',
          html: emailHtml,
          text: `GOVERNMENT OF TAMIL NADU - OFFICIAL MEMORANDUM\n\nCard Identification Number: ${assignedCard}\nDesignated Officer: Municipal Admin\nAuthorized Email: ${cleanEmail}\n\nPlease enter this card number to log in to the Command Center.`,
          status: 'pending'
        }
      ]);

      return {
        success: true,
        cardIssued: true,
        isNew,
        message: isNew
          ? `Your Permanent Municipal Security Card Number has been generated and sent to ${cleanEmail}. Please enter your card number to log in.`
          : `Your Permanent Municipal Security Card Number has been resent to ${cleanEmail}. Please enter your card number to log in.`
      };
    } catch (err: any) {
      console.error('[AUTH-CONTEXT] Error issuing admin card via Supabase:', err);
      return {
        success: false,
        error: 'Unable to dispatch Security Card email. Please verify network connection.'
      };
    }
  };

  /**
   * 2. Request 6-digit OTP for 1st-Time Citizen Signup
   * The code is strictly dispatched via email and NEVER shown in the response message.
   */
  const requestOtp = async (
    email: string,
    role: UserRole,
    name?: string
  ): Promise<{
    success: boolean;
    emailSent?: boolean;
    message?: string;
    error?: string;
  }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 2A. Try API route first (Node.js server)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, role, name })
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.success) {
          return {
            success: true,
            emailSent: data.emailSent,
            message: data.message
          };
        }
      }
    } catch (_) {}

    // 2B. Supabase Realtime Fallback (Firebase Static Hosting & Universal Cross-Device)
    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store in Supabase otp_verifications
      await supabase.from('otp_verifications').upsert([
        {
          email: cleanEmail,
          code: otpCode,
          role,
          name: name || 'Civilian Citizen',
          expires_at: expiresAt
        }
      ]);

      // Enqueue official memorandum OTP email
      const emailHtml = renderOtpOmHtml({
        toEmail: cleanEmail,
        otp: otpCode,
        recipientName: name || 'Civilian Citizen'
      });

      await supabase.from('mail_queue').insert([
        {
          to_email: cleanEmail,
          subject: `Your Verification Passcode: ${otpCode} - MyGovt AI Hub`,
          html: emailHtml,
          text: `GOVERNMENT OF TAMIL NADU - OFFICIAL MEMORANDUM\n\nSub: One-Time Passcode (OTP) for Identity Verification.\n\nYour Verification Passcode is: ${otpCode}\nValid for 10 minutes. Do not share with anyone.`,
          status: 'pending'
        }
      ]);

      return {
        success: true,
        emailSent: true,
        message: `Verification code sent to ${cleanEmail}. Please check your Inbox and Spam/Junk folder.`
      };
    } catch (err: any) {
      console.error('[AUTH-CONTEXT] Error requesting OTP via Supabase:', err);
      return {
        success: false,
        error: 'Unable to dispatch verification code email. Please check your network connection.'
      };
    }
  };

  /**
   * 3. Sign In (Admin via Card / Existing Citizen via Email)
   */
  const signIn = async (
    email: string,
    role?: UserRole,
    cardNumber?: string
  ): Promise<{
    success: boolean;
    user?: User;
    notRegistered?: boolean;
    requiresCard?: boolean;
    cardIssued?: boolean;
    message?: string;
    error?: string;
  }> => {
    const cleanEmail = email.toLowerCase().trim();
    const isAdmin = role === 'admin' || isAuthorizedAdmin(cleanEmail);

    // 3A. Try API route first (Node.js server)
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, role, cardNumber })
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.success && data.user) {
          const authenticatedUser = data.user as User;
          if (authenticatedUser.name) {
            authenticatedUser.name = authenticatedUser.name.replace(/commissioner\s*/gi, '').trim();
          }
          setUser(authenticatedUser);
          try {
            localStorage.setItem('mygovtai_session_user', JSON.stringify(authenticatedUser));
          } catch (_) {}
          return { success: true, user: authenticatedUser, message: data.message };
        } else if (data && (data.requiresCard || data.notRegistered)) {
          return {
            success: false,
            notRegistered: data.notRegistered,
            requiresCard: data.requiresCard,
            error: data.error
          };
        }
      }
    } catch (_) {}

    // 3B. Supabase Fallback
    try {
      if (isAdmin) {
        if (!isAuthorizedAdmin(cleanEmail)) {
          return {
            success: false,
            error: 'Access Denied: Only authorized municipal officials are permitted to access the Official Command Center.'
          };
        }

        if (!cardNumber || !cardNumber.trim()) {
          return {
            success: false,
            requiresCard: true,
            error: 'Please enter your Permanent Municipal Security Card Number to log in. If this is your first time, click "Issue / Email My Permanent Security Card".'
          };
        }

        // Verify against Supabase admin_security_cards
        const { data: cardRecord } = await supabase
          .from('admin_security_cards')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (!cardRecord || !cardRecord.card_number) {
          return {
            success: false,
            error: 'No Permanent Municipal Card found for this account. Please click "Issue / Email My Permanent Security Card" below.'
          };
        }

        if (normalizeCard(cardRecord.card_number) !== normalizeCard(cardNumber)) {
          return {
            success: false,
            error: 'Invalid Municipal Security Card Number. Please enter the permanent card number dispatched to your email.'
          };
        }

        const adminUser: User = {
          id: 'USR-ADM-001',
          name: cardRecord.name || 'Municipal Admin',
          email: cleanEmail,
          role: 'admin',
          officialId: 'TN-SAMPLE-2026',
          cardNumber: cardRecord.card_number,
          verified: true,
          department: cardRecord.department || 'Tamil Nadu Municipal Administration & Urban Water Supply'
        };

        setUser(adminUser);
        try {
          localStorage.setItem('mygovtai_session_user', JSON.stringify(adminUser));
        } catch (_) {}

        return { success: true, user: adminUser, message: 'Welcome to Municipal Command Center' };
      }

      // Citizen Sign In
      const { data: citizenRecord } = await supabase
        .from('registered_users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!citizenRecord) {
        return {
          success: false,
          notRegistered: true,
          error: "Account not registered yet. Please select the 'Sign Up (1st Time Only)' tab to complete one-time email OTP verification."
        };
      }

      const citizenUser: User = {
        id: citizenRecord.id || `USR-CIT-${Math.floor(1000 + Math.random() * 9000)}`,
        name: citizenRecord.name || 'Civilian Citizen',
        email: cleanEmail,
        role: 'citizen',
        verified: true
      };

      setUser(citizenUser);
      try {
        localStorage.setItem('mygovtai_session_user', JSON.stringify(citizenUser));
      } catch (_) {}

      return { success: true, user: citizenUser, message: `Welcome back, ${citizenUser.name}` };
    } catch (err: any) {
      console.error('[AUTH-CONTEXT] Error during sign in via Supabase:', err);
      return {
        success: false,
        error: 'Authentication failed. Please verify credentials or network connection.'
      };
    }
  };

  /**
   * 4. Verify OTP and Complete Registration
   */
  const verifyOtpAndLogin = async (
    email: string,
    code: string,
    officialId?: string,
    name?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    // 4A. Try API route first (Node.js server)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode, officialId, name })
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.success && data.user) {
          const authenticatedUser = data.user as User;
          if (authenticatedUser.name) {
            authenticatedUser.name = authenticatedUser.name.replace(/commissioner\s*/gi, '').trim();
          }
          setUser(authenticatedUser);
          try {
            localStorage.setItem('mygovtai_session_user', JSON.stringify(authenticatedUser));
          } catch (_) {}
          return { success: true, user: authenticatedUser };
        } else if (data && !data.success) {
          return { success: false, error: data.error || 'Invalid verification credentials.' };
        }
      }
    } catch (_) {}

    // 4B. Supabase Fallback
    try {
      const { data: otpRecord } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!otpRecord) {
        return {
          success: false,
          error: 'No active verification code found for this email. Please request a new code.'
        };
      }

      if (Date.now() > Number(otpRecord.expires_at)) {
        return {
          success: false,
          error: 'Verification passcode has expired (valid for 10 minutes). Please request a new code.'
        };
      }

      if (otpRecord.code.trim() !== cleanCode) {
        return {
          success: false,
          error: 'Invalid verification passcode. Please enter the 6-digit code received in your email.'
        };
      }

      // Valid OTP: Register citizen in Supabase registered_users
      const cleanName = (name || otpRecord.name || cleanEmail.split('@')[0].replace(/[._]/g, ' '))
        .replace(/commissioner\s*/gi, '')
        .trim();

      const newUser: User = {
        id: `USR-CIT-${Math.floor(1000 + Math.random() * 9000)}`,
        name: cleanName || 'Civilian Citizen',
        email: cleanEmail,
        role: 'citizen',
        verified: true
      };

      await supabase.from('registered_users').upsert([
        {
          email: cleanEmail,
          id: newUser.id,
          name: newUser.name,
          role: 'citizen',
          verified: true
        }
      ]);

      // Remove used OTP
      await supabase.from('otp_verifications').delete().eq('email', cleanEmail);

      setUser(newUser);
      try {
        localStorage.setItem('mygovtai_session_user', JSON.stringify(newUser));
      } catch (_) {}

      return { success: true, user: newUser };
    } catch (err: any) {
      console.error('[AUTH-CONTEXT] Error verifying OTP via Supabase:', err);
      return {
        success: false,
        error: 'Failed to verify OTP passcode. Please check network connection.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('mygovtai_session_user');
      localStorage.removeItem('infrapulse_session_user');
    } catch (_) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        issueAdminCard,
        requestOtp,
        verifyOtpAndLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
