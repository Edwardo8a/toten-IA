const loyverseClient = require('../../../../config/loyverseClient');

class DeleteDiscountCommandHandler {
  async execute(command) {
    const { id } = command;
    console.log(`[DeleteDiscountCommandHandler] Eliminando descuento ${id} en Loyverse...`);
    const result = await loyverseClient.delete(`/discounts/${id}`, { logPayload: true });
    return result || { success: true, message: 'Descuento eliminado correctamente en Loyverse.' };
  }
}

module.exports = DeleteDiscountCommandHandler;
