const loyverseClient = require('../../../../config/loyverseClient');
const ValidationError = require('../../../../core/errors/ValidationError');

const TIPOS_VALIDOS = ['FIXED_PERCENT', 'FIXED_AMOUNT'];

class UpdateDiscountCommandHandler {
  async execute(command) {
    const { id, nombre, tipo, valor, tiendas } = command;

    if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
      throw new ValidationError(`Tipo inválido. Debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`);
    }

    let storeIds = tiendas;
    if (!storeIds || !Array.isArray(storeIds) || storeIds.length === 0) {
      const storesRes = await loyverseClient.get('/stores');
      const stores = storesRes?.stores || [];
      storeIds = stores.map((s) => s.id);
    }

    const payload = {
      name: nombre,
      type: tipo,
      restricted_access: false,
      stores: storeIds
    };

    if (valor !== undefined && valor !== null) {
      const numVal = parseFloat(valor);
      if (tipo === 'FIXED_PERCENT') {
        payload.discount_percent = numVal;
      } else if (tipo === 'FIXED_AMOUNT') {
        payload.discount_amount = numVal;
      }
    }

    console.log(`[UpdateDiscountCommandHandler] Actualizando descuento ${id}:`, JSON.stringify(payload, null, 2));
    const result = await loyverseClient.put(`/discounts/${id}`, payload, { logPayload: true });
    return result;
  }
}

module.exports = UpdateDiscountCommandHandler;
