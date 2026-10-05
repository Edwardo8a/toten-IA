const { slugify } = require('../../src/utils/slugify');

describe('Slugify Utility Unit Tests', () => {
  test('Debe convertir acentos y mayúsculas correctamente', () => {
    expect(slugify('Café Americano')).toBe('cafe-americano');
    expect(slugify('Frappé Moka Grande')).toBe('frappe-moka-grande');
  });

  test('Debe eliminar caracteres especiales y múltiples guiones', () => {
    expect(slugify('Taza Negra / Edición Especial! @2026')).toBe('taza-negra-edicion-especial-2026');
  });

  test('Debe manejar strings vacíos o nulos sin romperse', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
  });
});
