import fs from 'fs';
import path from 'path';
import os from 'os';
import { User, UserRole } from '@/types/auth';

const USERS_FILE = path.join(os.tmpdir(), 'mygovt_registered_users.json');

const INITIAL_REGISTERED_USERS: Record<string, User> = {
  'mygovtaihub@gmail.com': {
    id: 'USR-ADM-001',
    name: 'Municipal Admin',
    email: 'mygovtaihub@gmail.com',
    role: 'admin',
    officialId: 'TN-SAMPLE-2026',
    verified: true,
    department: 'Tamil Nadu Municipal Administration & Urban Water Supply'
  },
  'arjun.verma@gmail.com': {
    id: 'USR-CIT-1001',
    name: 'Arjun Verma (Citizen Scout)',
    email: 'arjun.verma@gmail.com',
    role: 'citizen',
    verified: true
  },
  'citizen@gmail.com': {
    id: 'USR-CIT-1002',
    name: 'Civilian Citizen',
    email: 'citizen@gmail.com',
    role: 'citizen',
    verified: true
  }
};

function readStore(): Record<string, User> {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      writeStore(INITIAL_REGISTERED_USERS);
      return { ...INITIAL_REGISTERED_USERS };
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Record<string, User>;
    return { ...INITIAL_REGISTERED_USERS, ...parsed };
  } catch (err) {
    console.error('[USER-STORE] Error reading users store file:', err);
    return { ...INITIAL_REGISTERED_USERS };
  }
}

function writeStore(store: Record<string, User>): void {
  try {
    const tempFile = `${USERS_FILE}.${Date.now()}.${Math.random().toString(36).substring(7)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(tempFile, USERS_FILE);
  } catch (err) {
    console.error('[USER-STORE] Error writing users store file:', err);
  }
}

export function clearUserStore(): void {
  try {
    if (fs.existsSync(USERS_FILE)) {
      fs.unlinkSync(USERS_FILE);
    }
  } catch (err) {
    console.error('[USER-STORE] Error clearing users store file:', err);
  }
}

export function getRegisteredUser(email: string): User | null {
  const cleanEmail = (email || '').trim().toLowerCase();
  const store = readStore();
  const user = store[cleanEmail];
  if (!user) return null;
  
  if (user.name) {
    user.name = user.name.replace(/commissioner\s*/gi, '').trim();
  }
  return user;
}

export function registerUser(user: Partial<User> & { email: string; role: UserRole }): User {
  const cleanEmail = user.email.trim().toLowerCase();
  const cleanName = (user.name || (user.role === 'admin' ? 'Municipal Admin' : 'Civilian Citizen'))
    .replace(/commissioner\s*/gi, '')
    .trim();

  const store = readStore();
  const existing = store[cleanEmail];
  
  const newUser: User = {
    id: user.id || existing?.id || (user.role === 'admin' ? 'USR-ADM-001' : `USR-CIT-${Math.floor(1000 + Math.random() * 9000)}`),
    name: cleanName,
    email: cleanEmail,
    role: user.role,
    officialId: user.role === 'admin' ? (user.officialId || existing?.officialId || 'TN-SAMPLE-2026') : undefined,
    cardNumber: user.cardNumber || existing?.cardNumber,
    verified: true,
    department: user.role === 'admin' ? 'Tamil Nadu Municipal Administration & Urban Water Supply' : undefined
  };

  store[cleanEmail] = newUser;
  writeStore(store);
  return newUser;
}

/**
 * Issues or retrieves a permanent Municipal Security Card Number for an authorized admin.
 * If already issued, returns the existing card number without modifying it.
 * Format: TN-MUNI-XXXX-XXXX
 */
export function issueAdminCardNumber(
  email: string,
  name?: string
): { cardNumber: string; isNew: boolean; user: User } {
  const cleanEmail = (email || '').trim().toLowerCase();
  const store = readStore();
  const existingUser = store[cleanEmail];

  if (existingUser && existingUser.cardNumber) {
    return {
      cardNumber: existingUser.cardNumber,
      isNew: false,
      user: existingUser
    };
  }

  // Generate a permanent municipal card number: TN-MUNI-XXXX-XXXX
  const part1 = Math.floor(1000 + Math.random() * 9000).toString();
  const part2 = Math.floor(1000 + Math.random() * 9000).toString();
  const permanentCardNumber = `TN-MUNI-${part1}-${part2}`;

  const cleanName = (name || existingUser?.name || 'Municipal Admin')
    .replace(/commissioner\s*/gi, '')
    .trim();

  const updatedAdmin: User = {
    id: existingUser?.id || 'USR-ADM-001',
    name: cleanName,
    email: cleanEmail,
    role: 'admin',
    officialId: existingUser?.officialId || 'TN-SAMPLE-2026',
    cardNumber: permanentCardNumber,
    verified: true,
    department: 'Tamil Nadu Municipal Administration & Urban Water Supply'
  };

  store[cleanEmail] = updatedAdmin;
  writeStore(store);

  return {
    cardNumber: permanentCardNumber,
    isNew: true,
    user: updatedAdmin
  };
}

/**
 * Verifies a candidate card number against the user's permanent card number.
 * Normalizes hyphens, spaces, and casing.
 */
export function verifyAdminCardNumber(
  email: string,
  inputCardNumber: string
): { valid: boolean; user?: User; error?: string } {
  const cleanEmail = (email || '').trim().toLowerCase();
  const store = readStore();
  const user = store[cleanEmail];

  if (!user || user.role !== 'admin') {
    return {
      valid: false,
      error: 'Access Denied: Only authorized municipal officials are permitted to access the Official Command Center. For any issue, reach: mygovtaihub@gmail.com'
    };
  }

  if (!user.cardNumber) {
    return {
      valid: false,
      error: 'No Permanent Municipal Card has been issued for this account yet. Please click "Issue My Permanent Security Card".'
    };
  }

  const normalize = (s: string) => (s || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  if (normalize(user.cardNumber) !== normalize(inputCardNumber)) {
    return {
      valid: false,
      error: 'Invalid Municipal Security Card Number. Please enter the permanent card number dispatched to your email.'
    };
  }

  return {
    valid: true,
    user
  };
}
