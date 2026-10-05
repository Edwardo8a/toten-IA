const request = require('supertest');
const app = require('../../src/app');

describe('Security Middleware Protection Tests', () => {
  const protectedRoutes = [
    { method: 'get', url: '/api/productos' },
    { method: 'post', url: '/api/productos' },
    { method: 'get', url: '/api/descuentos' },
    { method: 'post', url: '/api/descuentos' },
    { method: 'get', url: '/api/ventas' },
    { method: 'get', url: '/api/ventas/resumen' },
    { method: 'get', url: '/api/cupones' },
    { method: 'get', url: '/api/clientes/stats' },
    { method: 'get', url: '/api/estadisticas/top-productos' },
    { method: 'get', url: '/api/estadisticas/afinidad' }
  ];

  test.each(protectedRoutes)('$method.toUpperCase() $url debe rechazar sin token con 401', async ({ method, url }) => {
    const res = await request(app)[method](url);
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('No autorizado');
  });
});
