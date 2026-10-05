const request = require('supertest');
const app = require('../../src/app');

describe('Healthcheck API Tests', () => {
  test('GET /api/health debe responder 200 y detalles del servicio', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.architecture).toBe('Pure CQRS (Command Query Responsibility Segregation)');
    expect(res.body.service).toBe('backend-cafe-lobo-cqrs');
    expect(res.body.env).toHaveProperty('supabase_configured');
    expect(res.body.env).toHaveProperty('loyverse_configured');
    expect(res.body.env).toHaveProperty('admin_configured');
  });

  test('GET /api/ruta-inexistente debe responder 404', async () => {
    const res = await request(app).get('/api/ruta-inexistente');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
