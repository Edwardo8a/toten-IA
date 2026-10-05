const loyverseClient = require('../../../../config/loyverseClient');
const supabase = require('../../../../config/supabaseClient');

class GetSalesSummaryQueryHandler {
  async execute(query) {
    const { created_at_min, created_at_max, store_id } = query;

    // Loyverse Free Tier requiere created_at_min <= 31 días atrás
    const defaultMin = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString();
    const effectiveMin = created_at_min || defaultMin;

    // 1. Obtener recibos de Loyverse
    const allReceipts = [];
    let cursor = null;
    let pages = 0;
    const maxPages = 10;

    while (pages < maxPages) {
      const p = { limit: 250, created_at_min: effectiveMin };
      if (created_at_max) p.created_at_max = created_at_max;
      if (store_id) p.store_id = store_id;
      if (cursor) p.cursor = cursor;

      const data = await loyverseClient.get('/receipts', p);
      const receipts = data?.receipts || [];
      allReceipts.push(...receipts);
      pages++;

      cursor = data?.cursor;
      if (!cursor || receipts.length === 0) break;
    }

    // 2. Obtener catálogo de Supabase
    let catalogo = [];
    try {
      const { data } = await supabase.from('productos').select('*');
      catalogo = data || [];
    } catch (err) {
      console.warn('[GetSalesSummaryQueryHandler] Error al cargar catálogo de Supabase:', err.message);
    }

    const prodByVariantId = new Map();
    const prodByHandle = new Map();
    for (const p of catalogo) {
      if (p.loyverse_variant_id) {
        prodByVariantId.set(String(p.loyverse_variant_id).toLowerCase(), p);
      }
      const handle = p.loyverse_handle || p.loyverse_ref;
      if (handle) {
        prodByHandle.set(String(handle).toLowerCase(), p);
      }
    }

    // 3. Agrupación en memoria
    const agrupado = new Map();
    let totalGeneralDinero = 0;
    let totalGeneralUnidades = 0;

    for (const receipt of allReceipts) {
      if (receipt.receipt_type === 'REFUND') continue;

      const lineItems = receipt.line_items || [];
      for (const item of lineItems) {
        const variantId = item.variant_id ? String(item.variant_id).toLowerCase() : null;
        const sku = item.sku ? String(item.sku).toLowerCase() : null;
        const itemName = item.item_name || 'Desconocido';
        const qty = parseFloat(item.quantity) || 0;
        const total = parseFloat(item.total_money) || (qty * (parseFloat(item.price) || 0));

        let matched = null;
        if (variantId && prodByVariantId.has(variantId)) {
          matched = prodByVariantId.get(variantId);
        } else if (sku && prodByHandle.has(sku)) {
          matched = prodByHandle.get(sku);
        }

        const groupKey = matched
          ? (matched.loyverse_handle || matched.loyverse_ref || `prod_${matched.id}`)
          : (sku || variantId || itemName);

        if (!agrupado.has(groupKey)) {
          agrupado.set(groupKey, {
            producto_id: matched?.id || null,
            nombre: matched?.nombre || itemName,
            categoria: matched?.categoria || 'General',
            loyverse_handle: matched?.loyverse_handle || matched?.loyverse_ref || sku || null,
            loyverse_variant_id: matched?.loyverse_variant_id || variantId || null,
            unidades: 0,
            total_dinero: 0,
            recibos_count: 0
          });
        }

        const entry = agrupado.get(groupKey);
        entry.unidades += qty;
        entry.total_dinero += total;
        entry.recibos_count += 1;

        totalGeneralDinero += total;
        totalGeneralUnidades += qty;
      }
    }

    const itemsOrdenados = Array.from(agrupado.values())
      .map((item) => ({
        ...item,
        total_dinero: Math.round(item.total_dinero * 100) / 100,
        precio_promedio: item.unidades > 0 ? Math.round((item.total_dinero / item.unidades) * 100) / 100 : 0
      }))
      .sort((a, b) => b.unidades - a.unidades);

    return {
      resumen: itemsOrdenados,
      total_ventas: Math.round(totalGeneralDinero * 100) / 100,
      total_unidades: totalGeneralUnidades,
      total_recibos: allReceipts.length,
      rango: {
        created_at_min: created_at_min || null,
        created_at_max: created_at_max || null,
        store_id: store_id || null
      }
    };
  }
}

module.exports = GetSalesSummaryQueryHandler;
