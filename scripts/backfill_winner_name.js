#!/usr/bin/env node
// backfill_winner_name.js
// Fills null winner_name in winners from participants.name

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// load dotenv if available
try { require('dotenv').config({ path: path.resolve(process.cwd(), '.env') }); } catch(e) {}

async function main() {
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || process.env.DATABASE_URL_LOCAL;
  if (!databaseUrl) {
    console.error('DATABASE_URL or DIRECT_URL not set in env');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected to DB. Running backfill...');
    const res = await client.query(`
      UPDATE winners w
      SET winner_name = p.name
      FROM participants p
      WHERE w.participant_id = p.participant_id
        AND (w.winner_name IS NULL OR TRIM(w.winner_name) = '')
      RETURNING w.winner_id, w.participant_id, w.winner_name;
    `);
    console.log('Backfill completed. Rows updated:', res.rowCount);
    if (res.rows && res.rows.length > 0) {
      console.log('Sample updated rows:', res.rows.slice(0,10));
    }
  } catch (err) {
    console.error('Backfill failed:', err.message || err);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main();
