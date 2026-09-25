import crypto from 'crypto';
import { UserRole } from '@/types/auth';

interface StoredOtp {
  code: string;
  role: UserRole;
  name?: string;
  officialId?: string;
  expiresAt: number;
  attempts: number;
}

// Global OTP store singleton to persist across Next.js API route invocations in development/production
declare global {
  var __mygovt_otp_store__: Map<string, StoredOtp> | undefined;
}

const otpStore: Map<string, StoredOtp> =
  globalThis.__mygovt_otp_store__ || new Map<string, StoredOtp>();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__mygovt_otp_store__ = otpStore;
}

export function generateSecureOtp(): string {
  // Generate random 6-digit OTP
  return crypto.randomInt(100000, 999999).toString();
}

export function saveOtpRecord(
  email: string,
  role: UserRole,
  name?: string,
  officialId?: string
): { code: string; expiresAt: number } {
  const cleanEmail = email.trim().toLowerCase();
  const code = generateSecureOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(cleanEmail, {
    code,
    role,
    name,
    officialId,
    expiresAt,
    attempts: 0
  });

  return { code, expiresAt };
}

export function verifyOtpRecord(
  email: string,
  code: string
): {
  valid: boolean;
  error?: string;
  data?: { role: UserRole; name?: string; officialId?: string };
} {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return {
      valid: false,
      error: 'No active verification code found for this email. Please request a new code.'
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return {
      valid: false,
      error: 'Verification code has expired. Please request a fresh code.'
    };
  }

  if (record.attempts >= 5) {
    otpStore.delete(cleanEmail);
    return {
      valid: false,
      error: 'Too many incorrect attempts. For security, please request a new verification code.'
    };
  }

  if (record.code !== cleanCode) {
    record.attempts += 1;
    const remaining = 5 - record.attempts;
    return {
      valid: false,
      error: `Invalid verification code. ${remaining} attempt(s) remaining.`
    };
  }

  // Success: extract details and remove OTP
  const { role, name, officialId } = record;
  otpStore.delete(cleanEmail);

  return {
    valid: true,
    data: { role, name, officialId }
  };
}

export function getPendingOtpCode(email: string): string | null {
  const record = otpStore.get(email.trim().toLowerCase());
  if (!record || Date.now() > record.expiresAt) return null;
  return record.code;
}
