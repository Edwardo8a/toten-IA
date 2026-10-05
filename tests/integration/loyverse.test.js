const request = require('supertest');
const app = require('../../src/app');

describe('Loyverse Queries Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'cafelobo2026' });
    authToken = loginRes.body.token;
  });

  test('GET /api/descuentos debe consultar Loyverse y retornar 200 con lista', async () => {
    const res = await request(app)
      .get('/api/descuentos')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/ventas con limit=3 debe retornar recibos de Loyverse', async () => {
    const res = await request(app)
      .get('/api/ventas?limit=3')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('receipts');
    expect(Array.isArray(res.body.receipts)).toBe(true);
  });
});
