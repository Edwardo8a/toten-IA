const loyverseClient = require('../../../../config/loyverseClient');
const supabase = require('../../../../config/supabaseClient');

class GetProductAffinityQueryHandler {
  async execute(query) {
    const { producto_id, loyverse_handle, variant_id } = query;

    let targetVariantId = variant_id ? String(variant_id).toLowerCase() : null;
    let targetHandle = loyverse_handle ? String(loyverse_handle).toLowerCase() : null;
    let targetNombre = null;

    if (producto_id) {
      try {
        const { data: prod } = await supabase
          .from('productos')
          .select('*')
          .eq('id', producto_id)
          .single();

        if (prod) {
          targetNombre = prod.nombre;
          if (prod.loyverse_variant_id) targetVariantId = String(prod.loyverse_variant_id).toLowerCase();
          const handle = prod.loyverse_handle || prod.loyverse_ref;
          if (handle) targetHandle = String(handle).toLowerCase();
        }
      } catch (err) {
        console.warn(`[GetProductAffinityQueryHandler] Producto ${producto_id} no encontrado en Supabase:`, err.message);
      }
    }

    // Traer muestra de recibos recientes (dentro de los 29 días permitidos en free tier)
    const defaultMin = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString();
    const allReceipts = [];
    let cursor = null;
    let pages = 0;
    const maxPages = 2;

    while (pages < maxPages) {
      const p = { limit: 250, created_at_min: defaultMin };
      if (cursor) p.cursor = cursor;

      const data = await loyverseClient.get('/receipts', p);
      const receipts = data?.receipts || [];
      allReceipts.push(...receipts);
      pages++;

      cursor = data?.cursor;
      if (!cursor || receipts.length === 0) break;
    }

    let recibosConTarget = 0;
    const coOcurrencias = new Map();

    for (const receipt of allReceipts) {
      const lineItems = receipt.line_items || [];

      const contieneTarget = lineItems.some((item) => {
        const vId = item.variant_id ? String(item.variant_id).toLowerCase() : null;
        const sku = item.sku ? String(item.sku).toLowerCase() : null;
        if (targetVariantId && vId === targetVariantId) return true;
        if (targetHandle && sku === targetHandle) return true;
        if (targetNombre && item.item_name && item.item_name.toLowerCase() === targetNombre.toLowerCase()) return true;
        return false;
      });

      if (!contieneTarget) continue;

      recibosConTarget++;

      for (const item of lineItems) {
        const vId = item.variant_id ? String(item.variant_id).toLowerCase() : null;
        const sku = item.sku ? String(item.sku).toLowerCase() : null;
        const itemName = item.item_name || 'Desconocido';

        const esTarget =
          (targetVariantId && vId === targetVariantId) ||
          (targetHandle && sku === targetHandle) ||
          (targetNombre && itemName.toLowerCase() === targetNombre.toLowerCase());

        if (esTarget) continue;

        const key = sku || vId || itemName;
        if (!coOcurrencias.has(key)) {
          coOcurrencias.set(key, {
            nombre: itemName,
            sku: sku || null,
            variant_id: vId || null,
            veces_juntos: 0
          });
        }

        coOcurrencias.get(key).veces_juntos += 1;
      }
    }

    const afinidades = Array.from(coOcurrencias.values())
      .map((item) => {
        const porcentaje = recibosConTarget > 0
          ? Math.round((item.veces_juntos / recibosConTarget) * 100)
          : 0;
        return {
          ...item,
          porcentaje_afinidad: `${porcentaje}%`,
          score: porcentaje
        };
      })
      .sort((a, b) => b.veces_juntos - a.veces_juntos);

    return {
      producto_target: {
        producto_id: producto_id || null,
        nombre: targetNombre,
        loyverse_handle: targetHandle,
        loyverse_variant_id: targetVariantId
      },
      recibos_analizados_con_target: recibosConTarget,
      total_recibos_muestra: allReceipts.length,
      productos_afines: afinidades
    };
  }
}

module.exports = GetProductAffinityQueryHandler;
