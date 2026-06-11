import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createPool } from '../db/pool.js';

dotenv.config();

async function main() {
  const pool = createPool({
    connectionString: process.env.DATABASE_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'ecomm',
  });

  // Schema lives in this repo under node-backend/src/db/schema.sql
  const schemaPath = path.resolve('src/db/schema.sql');
  const samplePath = path.resolve('src/db/sample-data.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const sampleSql = fs.existsSync(samplePath) ? fs.readFileSync(samplePath, 'utf8') : '';


  console.log('Initializing DB schema...');

  await pool.query(schemaSql);
  if (sampleSql) {
    console.log('Loading sample data...');
    await pool.query(sampleSql);
  }

  await pool.end();
  console.log('DB initialization complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

