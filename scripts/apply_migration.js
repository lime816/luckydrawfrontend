#!/usr/bin/env node
// apply_migration.js
// Usage: node apply_migration.js ./prisma/migrations/20251027_add_winner_name/migration.sql

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load .env automatically if present (prefer project .env over .env.example)
try {
  const dotenv = require('dotenv');
  // Prefer .env in current working directory, then the script's parent directory
  const cwdEnv = path.resolve(process.cwd(), '.env');
  const scriptEnv = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(cwdEnv)) {
    dotenv.config({ path: cwdEnv });
    console.log('Loaded environment from', cwdEnv);
  } else if (fs.existsSync(scriptEnv)) {
    dotenv.config({ path: scriptEnv });
    console.log('Loaded environment from', scriptEnv);
  } else {
    // fallback: try default dotenv behavior (will look for .env in cwd)
    dotenv.config();
  }
} catch (e) {
  // dotenv is optional; if not installed we'll rely on process.env being set
}

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node apply_migration.js <path-to-sql-file>');
    process.exit(1);
  }

  const sqlPath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }

  // Prefer explicit DIRECT_URL for migrations if present; otherwise use DATABASE_URL.
  // Note: dotenv won't overwrite an existing environment variable. If a system-level
  // DATABASE_URL placeholder like "postgres://...@host:5432/..." exists, prefer DIRECT_URL
  // from your local .env which typically contains the real host/port for migrations.
  let databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_LOCAL || process.env.DIRECT_URL;
  if (process.env.DIRECT_URL && databaseUrl) {
    try {
      const parsedCheck = new URL(databaseUrl);
      if (parsedCheck.hostname === 'host' || parsedCheck.hostname === 'db' || parsedCheck.hostname === 'localhost_placeholder') {
        console.log('Detected placeholder host in DATABASE_URL; falling back to DIRECT_URL from .env for migration.');
        databaseUrl = process.env.DIRECT_URL;
      }
    } catch (e) {
      // If parsing fails, still try DIRECT_URL if available
      if (process.env.DIRECT_URL) {
        console.log('Could not parse DATABASE_URL; falling back to DIRECT_URL for migration.');
        databaseUrl = process.env.DIRECT_URL;
      }
    }
  }

  // Final selection of databaseUrl
  databaseUrl = databaseUrl || process.env.DIRECT_URL || process.env.DATABASE_URL_LOCAL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL (or DIRECT_URL) environment variable is not set. Set it and retry.');
    process.exit(1);
  }

  // Diagnostic logging: print masked connection string and attempt to resolve host
  try {
    const masked = databaseUrl.replace(/:\/\/[\w\-]+:([^@]+)@/, '://user:*****@');
    console.log('Using DATABASE_URL:', masked);
    // extract host for DNS diagnostic
    let hostForDiag;
    try {
      const parsed = new URL(databaseUrl);
      hostForDiag = parsed.hostname;
      console.log('Parsed DB host:', hostForDiag, 'port:', parsed.port || '(default)');
    } catch (e) {
      // fall back to simple parsing
      const match = databaseUrl.match(/@([^:/?#]+)(:?\d*)/);
      if (match) {
        hostForDiag = match[1];
        console.log('Parsed DB host (fallback):', hostForDiag);
      }
    }

    if (hostForDiag) {
      const dns = require('dns');
      dns.lookup(hostForDiag, (err, address) => {
        if (err) console.warn('DNS lookup for DB host failed:', err.message);
        else console.log('DNS lookup OK:', hostForDiag, '->', address);
      });
    }
  } catch (e) {
    console.warn('Could not parse DATABASE_URL for diagnostics:', e.message || e);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  // Configure SSL for cloud providers (Supabase) when needed.
  // Allow explicit override via MIGRATION_PG_SSL=true in environment.
  let sslOption;
  if (process.env.MIGRATION_PG_SSL === 'true') {
    sslOption = { rejectUnauthorized: false };
    console.log('MIGRATION_PG_SSL=true -> using ssl: { rejectUnauthorized: false }');
  } else if (/supabase\.co|pooler\.supabase\.com|rds\.amazonaws\.com|aws-/.test(databaseUrl)) {
    // Auto-enable permissive SSL for known cloud hosts to avoid certificate issues in local Node
    sslOption = { rejectUnauthorized: false };
    console.log('Detected cloud DB host in connection string -> enabling ssl: { rejectUnauthorized: false }');
  }

  const client = new Client({ connectionString: databaseUrl, ssl: sslOption });

  try {
    await client.connect();
    console.log('Connected to DB. Beginning migration:', sqlPath);
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    try { await client.query('ROLLBACK'); } catch(e) { /* ignore */ }
    process.exit(2);
  } finally {
    await client.end();
  }
}

main();
