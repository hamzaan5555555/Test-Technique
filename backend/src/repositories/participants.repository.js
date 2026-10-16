import { pool } from '../config/db.js';
import { buildUpdate, escapeLike } from '../utils/sql.js';

const db = (client) => client ?? pool;

const COLUMNS = `id, full_name AS "fullName", email, phone, created_at AS "createdAt"`;

const UPDATE_COLUMNS = {
  fullName: 'full_name',
  email: 'email',
  phone: 'phone',
};

export async function create({ fullName, email, phone }, client) {
  const { rows } = await db(client).query(
    `INSERT INTO participants (full_name, email, phone)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [fullName, email, phone ?? null]
  );
  return rows[0];
}

export async function findById(id, client) {
  const { rows } = await db(client).query(`SELECT ${COLUMNS} FROM participants WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

 
export async function findAll({ search, limit, offset }) {
  const params = [];
  let where = '';

  if (search) {
    params.push(`%${escapeLike(search)}%`);
    where = 'WHERE full_name ILIKE $1 OR email ILIKE $1';
  }

  const [countResult, dataResult] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total FROM participants ${where}`, params),
    pool.query(
      `SELECT ${COLUMNS} FROM participants ${where}
       ORDER BY full_name ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
  ]);

  return { rows: dataResult.rows, total: countResult.rows[0].total };
}

export async function update(id, data, client) {
  const { sets, values } = buildUpdate(data, UPDATE_COLUMNS);
  if (sets.length === 0) return findById(id, client);

  values.push(id);
  const { rows } = await db(client).query(
    `UPDATE participants SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING ${COLUMNS}`,
    values
  );
  return rows[0] ?? null;
}

 
export async function remove(id, client) {
  const { rowCount } = await db(client).query('DELETE FROM participants WHERE id = $1', [id]);
  return rowCount > 0;
}