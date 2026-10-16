import { pool } from '../config/db.js';

export async function countEvents() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM events');
  return rows[0].count;
}

export async function countPublishedEvents() {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM events WHERE status = 'published'`
  );
  return rows[0].count;
}

/** Inscriptions créées aujourd'hui (hors annulées). */
export async function countRegistrationsToday() {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
       FROM registrations
      WHERE created_at >= date_trunc('day', now())
        AND created_at <  date_trunc('day', now()) + interval '1 day'
        AND status <> 'cancelled'`
  );
  return rows[0].count;
}

/** Top 5 des événements publiés les plus remplis (taux = inscrits actifs / capacité). */
export async function findTopEvents(limit = 5) {
  const { rows } = await pool.query(
    `SELECT e.id,
            e.title,
            e.event_date       AS "eventDate",
            e.max_participants AS "maxParticipants",
            e.status,
            COUNT(r.id) FILTER (WHERE r.status <> 'cancelled')::int AS "registrationsCount",
            ROUND(
              100.0 * COUNT(r.id) FILTER (WHERE r.status <> 'cancelled') / e.max_participants,
              1
            )::float AS "fillRate"
       FROM events e
       LEFT JOIN registrations r ON r.event_id = e.id
      WHERE e.status = 'published'
      GROUP BY e.id
      ORDER BY "fillRate" DESC, "registrationsCount" DESC, e.event_date ASC
      LIMIT $1`,
    [limit]
  );
  return rows;
}