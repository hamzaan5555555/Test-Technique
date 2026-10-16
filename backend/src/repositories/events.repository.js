import { pool } from '../config/db.js';
import { buildUpdate } from '../utils/sql.js';

const db = (client) => client ?? pool;

 
const SELECT_EVENT = `
  SELECT e.id,
         e.title,
         e.description,
         e.location,
         e.event_date        AS "eventDate",
         e.max_participants  AS "maxParticipants",
         e.status,
         e.created_by        AS "createdBy",
         e.created_at        AS "createdAt",
         e.updated_at        AS "updatedAt",
         (SELECT COUNT(*)::int
            FROM registrations r
           WHERE r.event_id = e.id AND r.status <> 'cancelled') AS "registrationsCount"
    FROM events e`;

const UPDATE_COLUMNS = {
  title: 'title',
  description: 'description',
  location: 'location',
  eventDate: 'event_date',
  maxParticipants: 'max_participants',
};

export async function create(data, client) {
  const { rows } = await db(client).query(
    `INSERT INTO events (title, description, location, event_date, max_participants, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      data.title,
      data.description ?? null,
      data.location,
      data.eventDate,
      data.maxParticipants,
      data.createdBy,
    ]
  );
  return rows[0];
}

export async function findById(id, client) {
  const { rows } = await db(client).query(`${SELECT_EVENT} WHERE e.id = $1`, [id]);
  return rows[0] ?? null;
}






export async function lockById(id, client) {
  const { rows } = await client.query(
    `SELECT id, status, max_participants AS "maxParticipants"
       FROM events
      WHERE id = $1
        FOR UPDATE`,
    [id]
  );
  return rows[0] ?? null;
}

 
export async function findAll({ status, date, limit, offset }) {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`e.status = $${params.length}`);
  }
  if (date) {
    params.push(date);
    const i = params.length;
    conditions.push(`e.event_date >= $${i}::date AND e.event_date < ($${i}::date + 1)`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult, dataResult] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total FROM events e ${where}`, params),
    pool.query(
      `${SELECT_EVENT} ${where}
       ORDER BY e.event_date DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
  ]);

  return { rows: dataResult.rows, total: countResult.rows[0].total };
}

export async function update(id, data, client) {
  const { sets, values } = buildUpdate(data, UPDATE_COLUMNS);
  if (sets.length === 0) return;

  values.push(id);
  await db(client).query(`UPDATE events SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
}

export async function setStatus(id, status, client) {
  await db(client).query('UPDATE events SET status = $2 WHERE id = $1', [id, status]);
}