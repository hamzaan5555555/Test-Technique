import { pool } from '../config/db.js';
import { buildUpdate } from '../utils/sql.js';

 
const db = (client) => client ?? pool;

 
const COLUMNS = `id, email, full_name AS "fullName", role, created_at AS "createdAt"`;

const UPDATE_COLUMNS = {
  email: 'email',
  passwordHash: 'password_hash',
  fullName: 'full_name',
  role: 'role',
};

export async function findById(id, client) {
  const { rows } = await db(client).query(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

 
export async function findByEmail(email, client) {
  const { rows } = await db(client).query(
    `SELECT ${COLUMNS}, password_hash AS "passwordHash" FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function findAll(client) {
  const { rows } = await db(client).query(`SELECT ${COLUMNS} FROM users ORDER BY created_at DESC`);
  return rows;
}

export async function create({ email, passwordHash, fullName, role }, client) {
  const { rows } = await db(client).query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNS}`,
    [email, passwordHash, fullName, role ?? 'staff']
  );
  return rows[0];
}

export async function update(id, data, client) {
  const { sets, values } = buildUpdate(data, UPDATE_COLUMNS);
  if (sets.length === 0) return findById(id, client);

  values.push(id);
  const { rows } = await db(client).query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING ${COLUMNS}`,
    values
  );
  return rows[0] ?? null;
}

export async function remove(id, client) {
  const { rowCount } = await db(client).query('DELETE FROM users WHERE id = $1', [id]);
  return rowCount > 0;
}