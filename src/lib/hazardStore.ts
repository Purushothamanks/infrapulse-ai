import fs from 'fs';
import path from 'path';
import os from 'os';
import { HazardReport } from '@/types/hazard';
import { initialHazards } from '@/data/mockHazards';

const HAZARDS_FILE = path.join(os.tmpdir(), 'mygovt_hazards_store.json');

function readStore(): HazardReport[] {
  try {
    if (!fs.existsSync(HAZARDS_FILE)) {
      writeStore(initialHazards);
      return initialHazards;
    }
    const data = fs.readFileSync(HAZARDS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as HazardReport[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialHazards;
  } catch (err) {
    console.error('[HAZARD-STORE] Error reading hazards store file:', err);
    return initialHazards;
  }
}

function writeStore(hazards: HazardReport[]): void {
  try {
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
  // Prepend to top of list
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
