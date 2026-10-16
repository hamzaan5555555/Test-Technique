import app from './app.js';
import { env } from './config/env.js';
import { pool, closePool } from './config/db.js';

async function start() {
  // Vérifie la connexion PostgreSQL avant d'accepter du trafic
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connecté');
  } catch (err) {
    console.error('Connexion PostgreSQL impossible :', err.message);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`API EventHub démarrée sur http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  // Arrêt propre (Ctrl+C, Docker stop)
  const shutdown = (signal) => {
    console.log(`${signal} reçu, arrêt du serveur...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
    // Sécurité : force l'arrêt après 10 s
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();