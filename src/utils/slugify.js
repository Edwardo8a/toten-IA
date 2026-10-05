/**
 * Convierte un texto en un slug adecuado para loyverse_handle / SKU
 * @param {string} text 
 * @returns {string}
 */
function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

module.exports = {
  slugify
};
