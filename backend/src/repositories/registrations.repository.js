import { pool } from '../config/db.js';

const db = (client) => client ?? pool;

 
const SELECT_REGISTRATION = `
  SELECT r.id,
         r.event_id       AS "eventId",
         r.participant_id AS "participantId",
         r.status,
         r.created_at     AS "createdAt",
         r.updated_at     AS "updatedAt",
         json_build_object('id', p.id, 'fullName', p.full_name, 'email', p.email) AS participant,
         json_build_object('id', e.id, 'title', e.title, 'status', e.status)      AS event
    FROM registrations r
    JOIN participants p ON p.id = r.participant_id
    JOIN events e       ON e.id = r.event_id`;

export async function create({ eventId, participantId, status }, client) {
  const { rows } = await db(client).query(
    `INSERT INTO registrations (event_id, participant_id, status)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [eventId, participantId, status]
  );
  return rows[0];
}

export async function findById(id, client) {
  const { rows } = await db(client).query(`${SELECT_REGISTRATION} WHERE r.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function findByEventAndParticipant(eventId, participantId, client) {
  const { rows } = await db(client).query(
    `SELECT id, status FROM registrations WHERE event_id = $1 AND participant_id = $2`,
    [eventId, participantId]
  );
  return rows[0] ?? null;
}

 
export async function countActiveByEvent(eventId, client) {
  const { rows } = await db(client).query(
    `SELECT COUNT(*)::int AS count
       FROM registrations
      WHERE event_id = $1 AND status <> 'cancelled'`,
    [eventId]
  );
  return rows[0].count;
}

 
export async function findAll({ eventId, status, limit, offset }) {
  const conditions = [];
  const params = [];

  if (eventId) {
    params.push(eventId);
    conditions.push(`r.event_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`r.status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult, dataResult] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total FROM registrations r ${where}`, params),
    pool.query(
      `${SELECT_REGISTRATION} ${where}
       ORDER BY r.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
  ]);

  return { rows: dataResult.rows, total: countResult.rows[0].total };
}

export async function setStatus(id, status, client) {
  await db(client).query('UPDATE registrations SET status = $2 WHERE id = $1', [id, status]);
}

 
export async function cancelAllByEvent(eventId, client) {
  const { rowCount } = await db(client).query(
    `UPDATE registrations SET status = 'cancelled'
      WHERE event_id = $1 AND status <> 'cancelled'`,
    [eventId]
  );
  return rowCount;
}