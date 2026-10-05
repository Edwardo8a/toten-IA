const { signToken, verifyToken } = require('../../src/config/jwt');

describe('JWT Config Unit Tests', () => {
  test('Debe firmar y verificar un token JWT exitosamente', () => {
    const payload = { username: 'admin', role: 'admin' };
    const token = signToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.username).toBe('admin');
    expect(decoded.role).toBe('admin');
  });

  test('Debe fallar al verificar un token inválido', () => {
    expect(() => {
      verifyToken('token.invalido.falso');
    }).toThrow();
  });
});
