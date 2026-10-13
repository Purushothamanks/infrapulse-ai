import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlFilePath = path.join(__dirname, '..', 'supabase_schema.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

async function runMigration() {
  console.log('[MIGRATION] Attempting direct connection to Supabase PostgreSQL...');

  // Try direct host
  const client = new pg.Client({
    host: 'db.mpymsolehyodfyamnpqn.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || '9487120719@p',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log('[MIGRATION] Successfully connected to Supabase PostgreSQL!');

    console.log('[MIGRATION] Executing SQL schema and seeding data...');
    await client.query(sqlContent);

    console.log('[MIGRATION] SUCCESS! Table "public.hazards" created, Realtime replication enabled, and data seeded.');
    await client.end();
    return true;
  } catch (err) {
    console.warn('[MIGRATION] Direct host failed:', err.message);
    try { await client.end(); } catch (_) {}
    return false;
  }
}

runMigration().then((success) => {
  if (success) {
    console.log('[MIGRATION] All done!');
    process.exit(0);
  } else {
    console.error('[MIGRATION] Migration could not complete on direct connection.');
    process.exit(1);
  }
});
