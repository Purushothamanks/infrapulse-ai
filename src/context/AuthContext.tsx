'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, VerificationRequest } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  sendVerificationCode: (email: string, name: string, role: UserRole, officialId?: string) => Promise<{ success: boolean; code: string; error?: string }>;
  verifyEmailAndSetPassword: (email: string, code: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickLogin: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial default accounts
const DEFAULT_USERS: Array<User & { password: string }> = [
  {
    id: 'USR-ADM-001',
    name: 'Chief Commissioner R. Mohan',
    email: 'admin@infrapulse.gov',
    password: 'admin123',
    role: 'admin',
    officialId: 'BBMP-OFF-4091',
    verified: true,
    department: 'Urban Development & Public Works'
  },
  {
    id: 'USR-CIT-001',
    name: 'Arjun Verma (Citizen Scout)',
    email: 'citizen@gmail.com',
    password: 'user123',
    role: 'citizen',
    verified: true
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingVerifications, setPendingVerifications] = useState<Record<string, { code: string; name: string; role: UserRole; officialId?: string }>>({});

  useEffect(() => {
    // Restore session from localStorage
    try {
      const stored = localStorage.getItem('infrapulse_session_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (_) {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check registered accounts
    const allUsers = [...DEFAULT_USERS];
    try {
      const customUsers = JSON.parse(localStorage.getItem('infrapulse_registered_users') || '[]');
      allUsers.push(...customUsers);
    } catch (_) {}

    const found = allUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.role === role
    );

    if (!found) {
      return { success: false, error: `No registered ${role === 'admin' ? 'Official' : 'Civilian'} account found with this email.` };
    }

    if (found.password !== password) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem('infrapulse_session_user', JSON.stringify(userData));
    return { success: true };
  };

  const sendVerificationCode = async (email: string, name: string, role: UserRole, officialId?: string): Promise<{ success: boolean; code: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, code: '', error: 'Please enter a valid email address.' };
    }

    // Generate a 4-digit verification code
    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();

    setPendingVerifications((prev) => ({
      ...prev,
      [cleanEmail]: { code: generatedCode, name, role, officialId }
    }));

    // In a real app, an email is dispatched. Here we simulate and return the code for instant UX
    return { success: true, code: generatedCode };
  };

  const verifyEmailAndSetPassword = async (email: string, code: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const pending = pendingVerifications[cleanEmail];

    if (!pending) {
      return { success: false, error: 'No verification request found for this email. Please request a new code.' };
    }

    if (pending.code !== code.trim()) {
      return { success: false, error: 'Incorrect verification code. Please check the code sent to your email.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const newUser = {
      id: `USR-${pending.role.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: pending.name || (pending.role === 'admin' ? 'Municipal Officer' : 'Civilian User'),
      email: cleanEmail,
      password,
      role: pending.role,
      officialId: pending.officialId,
      verified: true,
      department: pending.role === 'admin' ? 'Municipal Infrastructure Cell' : undefined
    };

    // Save to registered users
    try {
      const existing = JSON.parse(localStorage.getItem('infrapulse_registered_users') || '[]');
      localStorage.setItem('infrapulse_registered_users', JSON.stringify([...existing, newUser]));
    } catch (_) {}

    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem('infrapulse_session_user', JSON.stringify(userData));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('infrapulse_session_user');
  };

  const quickLogin = (role: UserRole) => {
    const target = DEFAULT_USERS.find((u) => u.role === role)!;
    const { password: _, ...userData } = target;
    setUser(userData);
    localStorage.setItem('infrapulse_session_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        sendVerificationCode,
        verifyEmailAndSetPassword,
        logout,
        quickLogin
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
