import fs from 'fs';
import path from 'path';
import os from 'os';
import { HazardReport } from '@/types/hazard';
import { initialHazards } from '@/data/mockHazards';

function resolveStorePath(): string {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const testFile = path.join(dataDir, `.write_check_${Date.now()}`);
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return path.join(dataDir, 'hazards_store.json');
  } catch (_) {
    return path.join(os.tmpdir(), 'mygovt_hazards_store.json');
  }
}

const HAZARDS_FILE = resolveStorePath();
let memoryCache: HazardReport[] | null = null;

function readStore(): HazardReport[] {
  try {
    if (!fs.existsSync(HAZARDS_FILE)) {
      writeStore(initialHazards);
      memoryCache = initialHazards;
      return initialHazards;
    }
    const data = fs.readFileSync(HAZARDS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as HazardReport[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryCache = parsed;
      return parsed;
    }
    // Seed with initial hazards if file was empty
    writeStore(initialHazards);
    memoryCache = initialHazards;
    return initialHazards;
  } catch (err) {
    console.error('[HAZARD-STORE] Error reading hazards store file:', err);
    return memoryCache || initialHazards;
  }
}

function writeStore(hazards: HazardReport[]): void {
  try {
    memoryCache = hazards;
    const tempFile = `${HAZARDS_FILE}.${Date.now()}.${Math.random().toString(36).substring(7)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(hazards, null, 2), 'utf-8');
    fs.renameSync(tempFile, HAZARDS_FILE);
  } catch (err) {
    console.error('[HAZARD-STORE] Error writing hazards store file:', err);
  }
}

export function getAllHazards(): HazardReport[] {
  return readStore();
}

export function addNewHazard(newHazard: HazardReport): HazardReport[] {
  const hazards = readStore();
  // Prepend new hazard to top, remove any duplicate by id
  const updated = [newHazard, ...hazards.filter((h) => h.id !== newHazard.id)];
  writeStore(updated);
  return updated;
}

export function updateExistingHazard(updatedHazard: HazardReport): HazardReport[] {
  const hazards = readStore();
  const next = hazards.map((h) => (h.id === updatedHazard.id ? updatedHazard : h));
  writeStore(next);
  return next;
}

export function deleteExistingHazard(hazardId: string): HazardReport[] {
  const hazards = readStore();
  const next = hazards.filter((h) => h.id !== hazardId);
  writeStore(next);
  return next;
}
