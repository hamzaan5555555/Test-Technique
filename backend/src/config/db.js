import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

 
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
});

 
pool.on('error', (err) => {
  console.error('Erreur inattendue du pool PostgreSQL :', err.message);
});

 
export function query(text, params) {
  return pool.query(text, params);
}






export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

 
export async function closePool() {
  await pool.end();
}

export default pool;
