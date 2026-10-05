const supabase = require('../../../../config/supabaseClient');
const loyverseClient = require('../../../../config/loyverseClient');
const { slugify } = require('../../../../utils/slugify');
const ValidationError = require('../../../../core/errors/ValidationError');
const AppError = require('../../../../core/errors/AppError');

class CreateProductCommandHandler {
  async execute(command) {
    const {
      nombre,
      categoria,
      descripcion = '',
      precio = 0,
      costo = 0,
      etiquetas_demograficas = [],
      loyverse_handle,
      loyverse_ref
    } = command;

    if (!nombre) {
      throw new ValidationError('El campo nombre es obligatorio.');
    }

    // 1) Generar slug si no se envía handle
    const handle = loyverse_handle || loyverse_ref || slugify(nombre);

    // 2) Insertar en Supabase
    const insertPayload = {
      nombre,
      categoria,
      descripcion,
      precio: parseFloat(precio) || 0,
      costo: parseFloat(costo) || 0,
      etiquetas_demograficas: Array.isArray(etiquetas_demograficas) ? etiquetas_demograficas : [],
      activo: true,
      loyverse_handle: handle
    };
    if (loyverse_ref) {
      insertPayload.loyverse_ref = loyverse_ref;
    }

    let insertedProduct = null;
    let { data, error } = await supabase
      .from('productos')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      if (error.message && error.message.includes('loyverse_handle')) {
        delete insertPayload.loyverse_handle;
        insertPayload.loyverse_ref = handle;
        const retry = await supabase.from('productos').insert(insertPayload).select().single();
        if (retry.error) {
          throw new AppError(`Error al insertar producto en Supabase: ${retry.error.message}`, 500);
        }
        data = retry.data;
      } else {
        throw new AppError(`Error al insertar producto en Supabase: ${error.message}`, 500);
      }
    }

    insertedProduct = data;
    const productoId = insertedProduct.id;

    // 3) POST /items a Loyverse (espejo)
    let loyverseResult = null;
    let loyverseSync = false;
    let loyverseWarning = null;

    try {
      const itemPayload = {
        item_name: nombre,
        variants: [
          {
            sku: handle,
            cost: parseFloat(costo) || 0,
            default_price: parseFloat(precio) || 0,
            default_pricing_type: 'FIXED'
          }
        ]
      };

      console.log(`[CreateProductCommandHandler] Creando item en Loyverse para producto ${productoId}...`);
      loyverseResult = await loyverseClient.post('/items', itemPayload, { logPayload: true });

      // 4) Actualizar variant_id en Supabase
      const variantId = loyverseResult?.variants?.[0]?.variant_id || null;
      if (variantId) {
        loyverseSync = true;
        const updateData = { loyverse_variant_id: variantId };
        if (loyverseResult.id) {
          updateData.loyverse_item_id = loyverseResult.id;
        }

        const { data: updated, error: updateErr } = await supabase
          .from('productos')
          .update(updateData)
          .eq('id', productoId)
          .select()
          .single();

        if (!updateErr && updated) {
          insertedProduct = updated;
        }
      } else {
        loyverseSync = true;
      }
    } catch (lvErr) {
      console.warn(`[CreateProductCommandHandler] Error al sincronizar con Loyverse:`, lvErr.message);
      loyverseSync = false;
      loyverseWarning = `Producto creado en base de datos local, pero falló sincronización con Loyverse: ${lvErr.message}`;
    }

    return {
      producto: insertedProduct,
      loyverse_sync: loyverseSync,
      loyverse_data: loyverseResult,
      warning: loyverseWarning
    };
  }
}

module.exports = CreateProductCommandHandler;
