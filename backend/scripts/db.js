// Usage : node scripts/db.js <schema|seed|reset>
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, '..', 'db');

const commands = {
  schema: ['schema.sql'],
  seed: ['seed.sql'],
  reset: ['schema.sql', 'seed.sql'],
};

const cmd = process.argv[2];

if (!commands[cmd]) {
  console.error('Usage : node scripts/db.js <schema|seed|reset>');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL manquant (copier .env.example vers .env)');
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  for (const file of commands[cmd]) {
    const sql = await fs.readFile(path.join(dbDir, file), 'utf8');
    await client.query(sql);
    console.log(`OK  ${file}`);
  }
} catch (err) {
  console.error('Erreur :', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}