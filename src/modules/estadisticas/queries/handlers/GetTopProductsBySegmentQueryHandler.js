const supabase = require('../../../../config/supabaseClient');

class GetTopProductsBySegmentQueryHandler {
  async execute(query) {
    const { segmento, valor } = query;

    let q = supabase.from('interacciones_totem').select('*');

    if (segmento === 'edad' || segmento === 'rango_edad') {
      if (valor) q = q.eq('edad_capturada', valor);
    } else if (segmento === 'genero') {
      if (valor) q = q.eq('genero_capturado', valor);
    }

    const { data: interacciones, error } = await q;
    if (error) {
      console.warn('[GetTopProductsBySegmentQueryHandler] Error en interacciones_totem:', error.message);
      return {
        segmento,
        valor: valor || 'todos',
        total_interacciones: 0,
        productos: []
      };
    }

    // Contar recomendaciones
    const conteo = new Map();
    for (const inter of interacciones || []) {
      const pId = inter.producto_recomendado_id;
      if (!pId) continue;
      conteo.set(pId, (conteo.get(pId) || 0) + 1);
    }

    // Obtener catálogo
    let productos = [];
    try {
      const { data } = await supabase.from('productos').select('*');
      productos = data || [];
    } catch (err) {
      console.warn('[GetTopProductsBySegmentQueryHandler] Error al cargar productos:', err.message);
    }
    const prodMap = new Map(productos.map((p) => [p.id, p]));

    const resultado = [];
    for (const [pId, totalRecomendado] of conteo.entries()) {
      const prod = prodMap.get(pId);
      resultado.push({
        producto_id: pId,
        nombre: prod?.nombre || `Producto ${pId}`,
        categoria: prod?.categoria || 'Sin categoría',
        precio: prod?.precio || 0,
        recomendaciones_totem: totalRecomendado
      });
    }

    resultado.sort((a, b) => b.recomendaciones_totem - a.recomendaciones_totem);

    return {
      segmento,
      valor: valor || 'todos',
      total_interacciones: interacciones?.length || 0,
      productos: resultado
    };
  }
}

module.exports = GetTopProductsBySegmentQueryHandler;
