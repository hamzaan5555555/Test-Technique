import { jest } from '@jest/globals';
import request from 'supertest';

const findUserById = jest.fn();
const findAllUsers = jest.fn();

jest.unstable_mockModule('../src/repositories/users.repository.js', () => ({
  findById: findUserById,
  findAll: findAllUsers,
}));

const { default: app } = await import('../src/app.js');
const { signToken } = await import('../src/utils/jwt.js');

const adminUser = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  email: 'admin@eventhub.com',
  fullName: 'Admin EventHub',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const staffUser = {
  ...adminUser,
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  email: 'staff@eventhub.com',
  fullName: 'Staff EventHub',
  role: 'staff',
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe('API HTTP avec Supertest', () => {
  test('GET /health renvoie le statut de disponibilité', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('GET /api-docs/ sert l’interface Swagger', async () => {
    const response = await request(app).get('/api-docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('EventHub API - Swagger');
    expect(response.text).toContain('swagger-ui');
  });

  test('POST /api/auth/login valide le corps et renvoie 400 si les champs sont invalides', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pas-un-email', password: '' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'password' }),
      ])
    );
  });

  test('GET /api/auth/me refuse une requête sans token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('TOKEN_MISSING');
  });

  test('GET /api/auth/me renvoie l’utilisateur pour un JWT valide', async () => {
    findUserById.mockResolvedValue(adminUser);
    const token = signToken(adminUser);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(adminUser);
    expect(findUserById).toHaveBeenCalledWith(adminUser.id);
  });

  test('GET /api/users refuse le rôle staff', async () => {
    findUserById.mockResolvedValue(staffUser);
    const token = signToken(staffUser);

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('INSUFFICIENT_ROLE');
  });

  test('GET /api/users autorise un admin et retourne la liste', async () => {
    findAllUsers.mockResolvedValue([adminUser]);
    findUserById.mockResolvedValue(adminUser);
    const token = signToken(adminUser);
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: [adminUser] });
    expect(findAllUsers).toHaveBeenCalledTimes(1);
  });
});
