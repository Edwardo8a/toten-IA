const loyverseClient = require('../../../../config/loyverseClient');
const ValidationError = require('../../../../core/errors/ValidationError');

const TIPOS_VALIDOS = ['FIXED_PERCENT', 'FIXED_AMOUNT'];

class CreateDiscountCommandHandler {
  async execute(command) {
    const { nombre, tipo, valor, tiendas } = command;

    if (!nombre) {
      throw new ValidationError('El campo nombre es obligatorio.');
    }

    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      throw new ValidationError(`Tipo inválido. Debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`);
    }

    if (valor === undefined || valor === null || isNaN(Number(valor))) {
      throw new ValidationError('El campo valor debe ser un número válido.');
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

    const numVal = parseFloat(valor);
    if (tipo === 'FIXED_PERCENT') {
      payload.discount_percent = numVal;
    } else if (tipo === 'FIXED_AMOUNT') {
      payload.discount_amount = numVal;
    }

    console.log('[CreateDiscountCommandHandler] Enviando payload a Loyverse:', JSON.stringify(payload, null, 2));
    const result = await loyverseClient.post('/discounts', payload, { logPayload: true });
    return result;
  }
}

module.exports = CreateDiscountCommandHandler;
