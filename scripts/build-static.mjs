import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const apiPath = path.join(rootDir, 'src', 'app', 'api');
const tempApiPath = path.join(rootDir, 'src', 'api_routes');

console.log('[BUILD-STATIC] Preparing Next.js static export for Firebase Hosting...');

let moved = false;
try {
  if (fs.existsSync(apiPath)) {
    console.log('[BUILD-STATIC] Temporarily moving src/app/api to preserve server routes during static generation...');
    fs.renameSync(apiPath, tempApiPath);
    moved = true;
  }

  // Remove stale .next cache to ensure fresh typegen and clean export
  const nextCache = path.join(rootDir, '.next');
  if (fs.existsSync(nextCache)) {
    fs.rmSync(nextCache, { recursive: true, force: true });
  }

  console.log('[BUILD-STATIC] Running next build with STATIC_EXPORT=true...');
  execSync('npx next build', {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      STATIC_EXPORT: 'true'
    }
  });

  console.log('[BUILD-STATIC] Export completed successfully! Artifacts placed in out/');
} catch (err) {
  console.error('[BUILD-STATIC] Build failed:', err);
  process.exitCode = 1;
} finally {
  if (moved && fs.existsSync(tempApiPath)) {
    console.log('[BUILD-STATIC] Restoring src/app/api...');
    fs.renameSync(tempApiPath, apiPath);
  }
}
