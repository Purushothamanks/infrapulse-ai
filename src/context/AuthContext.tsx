'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/auth';

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

  const issueAdminCard = async (
    email: string
  ): Promise<{
    success: boolean;
    cardIssued?: boolean;
    isNew?: boolean;
    message?: string;
    error?: string;
  }> => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'admin', action: 'issue_card' })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Failed to issue Permanent Municipal Security Card.'
        };
      }

      return {
        success: true,
        cardIssued: true,
        isNew: data.isNew,
        message: data.message
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error while contacting authentication server.'
      };
    }
  };

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
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, name })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Failed to dispatch verification code.'
        };
      }

      return {
        success: true,
        emailSent: data.emailSent,
        message: data.message
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error while contacting authentication server.'
      };
    }
  };

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
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, cardNumber })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          notRegistered: data.notRegistered,
          requiresCard: data.requiresCard,
          error: data.error || 'Failed to sign in.'
        };
      }

      const authenticatedUser = data.user as User;
      if (authenticatedUser.name) {
        authenticatedUser.name = authenticatedUser.name.replace(/commissioner\s*/gi, '').trim();
      }
      setUser(authenticatedUser);
      try {
        localStorage.setItem('mygovtai_session_user', JSON.stringify(authenticatedUser));
      } catch (_) {}

      return { success: true, user: authenticatedUser, message: data.message };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to sign in. Please check network connection.'
      };
    }
  };

  const verifyOtpAndLogin = async (
    email: string,
    code: string,
    officialId?: string,
    name?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, officialId, name })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Invalid verification credentials.'
        };
      }

      const authenticatedUser = data.user as User;
      if (authenticatedUser.name) {
        authenticatedUser.name = authenticatedUser.name.replace(/commissioner\s*/gi, '').trim();
      }
      setUser(authenticatedUser);
      try {
        localStorage.setItem('mygovtai_session_user', JSON.stringify(authenticatedUser));
      } catch (_) {}

      return { success: true, user: authenticatedUser };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to verify OTP code.'
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
