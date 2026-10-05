const supabase = require('../../../../config/supabaseClient');
const loyverseClient = require('../../../../config/loyverseClient');
const AppError = require('../../../../core/errors/AppError');

class UpdateProductCommandHandler {
  async execute(command) {
    const { id, data: updateData } = command;

    // 1. Obtener producto actual
    const { data: existing, error: findErr } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (findErr || !existing) {
      throw new AppError(`Producto no encontrado con ID ${id}`, 404);
    }

    const camposActualizar = {};
    if (updateData.nombre !== undefined) camposActualizar.nombre = updateData.nombre;
    if (updateData.categoria !== undefined) camposActualizar.categoria = updateData.categoria;
    if (updateData.descripcion !== undefined) camposActualizar.descripcion = updateData.descripcion;
    if (updateData.precio !== undefined) camposActualizar.precio = parseFloat(updateData.precio);
    if (updateData.costo !== undefined) camposActualizar.costo = parseFloat(updateData.costo);
    if (updateData.etiquetas_demograficas !== undefined) {
      camposActualizar.etiquetas_demograficas = updateData.etiquetas_demograficas;
    }
    if (updateData.loyverse_handle !== undefined) camposActualizar.loyverse_handle = updateData.loyverse_handle;
    if (updateData.loyverse_ref !== undefined) camposActualizar.loyverse_ref = updateData.loyverse_ref;
    if (updateData.activo !== undefined) camposActualizar.activo = Boolean(updateData.activo);

    const { data: updatedProduct, error: updateErr } = await supabase
      .from('productos')
      .update(camposActualizar)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      throw new AppError(`Error al actualizar producto en Supabase: ${updateErr.message}`, 500);
    }

    // Sincronización con Loyverse si cambiaron nombre, precio o costo
    let loyverseSync = false;
    let loyverseWarning = null;
    const necesitaSyncLoyverse =
      (updateData.nombre && updateData.nombre !== existing.nombre) ||
      (updateData.precio !== undefined && updateData.precio !== existing.precio) ||
      (updateData.costo !== undefined && updateData.costo !== existing.costo);

    const loyverseItemId = updatedProduct.loyverse_item_id || existing.loyverse_item_id;

    if (necesitaSyncLoyverse && loyverseItemId) {
      try {
        const itemUpdatePayload = {
          item_name: updatedProduct.nombre,
          variants: [
            {
              variant_id: updatedProduct.loyverse_variant_id || existing.loyverse_variant_id,
              sku: updatedProduct.loyverse_handle || updatedProduct.loyverse_ref || existing.loyverse_handle,
              cost: updatedProduct.costo,
              default_price: updatedProduct.precio,
              default_pricing_type: 'FIXED'
            }
          ]
        };

        console.log(`[UpdateProductCommandHandler] Sincronizando a Loyverse item ${loyverseItemId}...`);
        await loyverseClient.put(`/items/${loyverseItemId}`, itemUpdatePayload, { logPayload: true });
        loyverseSync = true;
      } catch (lvErr) {
        console.warn(`[UpdateProductCommandHandler] Error al actualizar item en Loyverse:`, lvErr.message);
        loyverseSync = false;
        loyverseWarning = `Producto actualizado en base de datos, pero falló sincronización en Loyverse: ${lvErr.message}`;
      }
    }

    return {
      producto: updatedProduct,
      loyverse_sync: loyverseSync,
      warning: loyverseWarning
    };
  }
}

module.exports = UpdateProductCommandHandler;
