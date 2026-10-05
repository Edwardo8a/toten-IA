const request = require('supertest');
const app = require('../../src/app');

describe('Auth Module CQRS Integration Tests', () => {
  test('POST /api/auth/login con credenciales incorrectas debe retornar 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'incorrect_password' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas.');
  });

  test('POST /api/auth/login con campos vacíos debe retornar 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('requeridos');
  });

  test('POST /api/auth/login con credenciales correctas debe retornar token JWT y 200', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'cafelobo2026' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token_type).toBe('Bearer');
    expect(res.body.user.username).toBe('admin');
    expect(res.body.user.role).toBe('admin');
  });

  test('GET /api/auth/me sin token debe responder 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me con token válido debe responder 200 y usuario', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'cafelobo2026' });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.username).toBe('admin');
    expect(meRes.body.user.role).toBe('admin');
  });
});
