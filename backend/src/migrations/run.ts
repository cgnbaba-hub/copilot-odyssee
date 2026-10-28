/**
 * Migration runner – executes all SQL files in order.
 * Usage: node dist/migrations/run.js
 */
import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id          SERIAL PRIMARY KEY,
        filename    VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM _migrations WHERE filename = $1',
        [file]
      );

      if (rows.length > 0) {
        console.log(`  ✓ Already executed: ${file}`);
        continue;
      }

      console.log(`  → Executing: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✓ Done: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log('\n✅ All migrations executed successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
