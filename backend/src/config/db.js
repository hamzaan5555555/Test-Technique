import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

/** Pool partagé par tous les repositories. */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
});

// Une erreur sur un client inactif ne doit pas faire planter le process.
pool.on('error', (err) => {
  console.error('Erreur inattendue du pool PostgreSQL :', err.message);
});

/** Exécute une requête avec le pool (hors transaction). */
export function query(text, params) {
  return pool.query(text, params);
}

/**
 * Exécute `fn` dans une transaction : BEGIN -> fn(client) -> COMMIT,
 * avec ROLLBACK automatique en cas d'erreur, puis libère le client.
 * Usage : await withTransaction((client) => { ... })
 */
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

/** Ferme proprement le pool (arrêt du serveur). */
export async function closePool() {
  await pool.end();
}

export default pool;
