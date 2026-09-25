import fs from 'fs';
import path from 'path';
import os from 'os';
import { User, UserRole } from '@/types/auth';

const USERS_FILE = path.join(os.tmpdir(), 'mygovt_registered_users.json');

const INITIAL_REGISTERED_USERS: Record<string, User> = {
  'purushothamank.s799@gmail.com': {
    id: 'USR-ADM-001',
    name: 'K. S. Purushothaman',
    email: 'purushothamank.s799@gmail.com',
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
      return INITIAL_REGISTERED_USERS;
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Record<string, User>;
    // Always ensure admin and initial users exist
    return { ...INITIAL_REGISTERED_USERS, ...parsed };
  } catch (err) {
    console.error('[USER-STORE] Error reading users store file:', err);
    return INITIAL_REGISTERED_USERS;
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

export function getRegisteredUser(email: string): User | null {
  const cleanEmail = (email || '').trim().toLowerCase();
  const store = readStore();
  const user = store[cleanEmail];
  if (!user) return null;
  
  // Ensure "Commissioner" is sanitized
  if (user.name) {
    user.name = user.name.replace(/commissioner\s*/gi, '').trim();
  }
  return user;
}

export function registerUser(user: Partial<User> & { email: string; role: UserRole }): User {
  const cleanEmail = user.email.trim().toLowerCase();
  const cleanName = (user.name || (user.role === 'admin' ? 'K. S. Purushothaman' : 'Civilian Citizen'))
    .replace(/commissioner\s*/gi, '')
    .trim();

  const store = readStore();
  
  const newUser: User = {
    id: user.id || (user.role === 'admin' ? 'USR-ADM-001' : `USR-CIT-${Math.floor(1000 + Math.random() * 9000)}`),
    name: cleanName,
    email: cleanEmail,
    role: user.role,
    officialId: user.role === 'admin' ? (user.officialId || 'TN-SAMPLE-2026') : undefined,
    verified: true,
    department: user.role === 'admin' ? 'Tamil Nadu Municipal Administration & Urban Water Supply' : undefined
  };

  store[cleanEmail] = newUser;
  writeStore(store);
  return newUser;
}
