import fs from 'fs';
import path from 'path';
import os from 'os';
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

const OTP_FILE = path.join(os.tmpdir(), 'mygovt_otp_store.json');

function readStore(): Record<string, StoredOtp> {
  try {
    if (!fs.existsSync(OTP_FILE)) {
      return {};
    }
    const data = fs.readFileSync(OTP_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Record<string, StoredOtp>;
    const now = Date.now();
    // Prune expired entries
    const clean: Record<string, StoredOtp> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (val.expiresAt > now) {
        clean[key] = val;
      }
    }
    return clean;
  } catch (err) {
    console.error('[OTP-STORE] Error reading OTP store file:', err);
    return {};
  }
}

function writeStore(store: Record<string, StoredOtp>): void {
  try {
    const tempFile = `${OTP_FILE}.${Date.now()}.${Math.random().toString(36).substring(7)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(tempFile, OTP_FILE);
  } catch (err) {
    console.error('[OTP-STORE] Error writing OTP store file:', err);
  }
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

  const store = readStore();
  store[cleanEmail] = {
    code,
    role,
    name,
    officialId,
    expiresAt,
    attempts: 0
  };
  writeStore(store);

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
  const store = readStore();
  const record = store[cleanEmail];

  if (!record) {
    return {
      valid: false,
      error: 'No active verification code found for this email. Please request a new code.'
    };
  }

  if (Date.now() > record.expiresAt) {
    delete store[cleanEmail];
    writeStore(store);
    return {
      valid: false,
      error: 'Verification code has expired. Please request a fresh code.'
    };
  }

  if (record.attempts >= 5) {
    delete store[cleanEmail];
    writeStore(store);
    return {
      valid: false,
      error: 'Too many incorrect attempts. For security, please request a new verification code.'
    };
  }

  if (record.code !== cleanCode) {
    record.attempts += 1;
    writeStore(store);
    const remaining = 5 - record.attempts;
    return {
      valid: false,
      error: `Invalid verification code. ${remaining} attempt(s) remaining.`
    };
  }

  // Success: extract details and remove OTP
  const { role, name, officialId } = record;
  delete store[cleanEmail];
  writeStore(store);

  return {
    valid: true,
    data: { role, name, officialId }
  };
}

export function getPendingOtpCode(email: string): string | null {
  const cleanEmail = email.trim().toLowerCase();
  const store = readStore();
  const record = store[cleanEmail];
  if (!record || Date.now() > record.expiresAt) return null;
  return record.code;
}
