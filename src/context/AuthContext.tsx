'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  requestOtp: (
    email: string,
    role: UserRole,
    name?: string
  ) => Promise<{ success: boolean; emailSent?: boolean; message?: string; devCode?: string; devOfficialId?: string; error?: string }>;
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
          setUser(parsed);
        }
      }
    } catch (_) {}
    setIsLoading(false);
  }, []);

  const requestOtp = async (
    email: string,
    role: UserRole,
    name?: string
  ): Promise<{ success: boolean; emailSent?: boolean; message?: string; devCode?: string; devOfficialId?: string; error?: string }> => {
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
        message: data.message,
        devCode: data.devCode,
        devOfficialId: data.devOfficialId
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error while contacting authentication server.'
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
