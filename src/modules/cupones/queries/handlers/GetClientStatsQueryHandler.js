const supabase = require('../../../../config/supabaseClient');

class GetClientStatsQueryHandler {
  async execute() {
    const { data, error } = await supabase
      .from('clientes')
      .select('rango_edad, genero_detectado');

    if (error) {
      console.warn('[GetClientStatsQueryHandler] Error al consultar clientes:', error.message);
      return {
        total_clientes: 0,
        demografia: []
      };
    }

    const agrupado = new Map();
    for (const c of data || []) {
      const rango = c.rango_edad || 'Desconocido';
      const genero = c.genero_detectado || 'Desconocido';
      const key = `${rango}__${genero}`;

      if (!agrupado.has(key)) {
        agrupado.set(key, {
          rango_edad: rango,
          genero_detectado: genero,
          total: 0
        });
      }
      agrupado.get(key).total += 1;
    }

    const demografia = Array.from(agrupado.values()).sort((a, b) => b.total - a.total);

    return {
      total_clientes: data ? data.length : 0,
      demografia
    };
  }
}

module.exports = GetClientStatsQueryHandler;
