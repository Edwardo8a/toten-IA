const supabase = require('../../../../config/supabaseClient');
const AppError = require('../../../../core/errors/AppError');

class GetCouponsQueryHandler {
  async execute(query) {
    const { estado, limit } = query;

    let q = supabase.from('cupones').select('*');

    if (estado) {
      q = q.eq('estado', estado.toLowerCase().trim());
    }

    q = q.order('fecha_creacion', { ascending: false }).limit(limit);

    const { data, error } = await q;
    if (error) {
      // Fallback si la columna no existe o difiere
      const fallback = await supabase.from('cupones').select('*').limit(limit);
      if (fallback.error) {
        throw new AppError(`Error al consultar cupones en Supabase: ${fallback.error.message}`, 500);
      }
      return fallback.data || [];
    }

    return data || [];
  }
}

module.exports = GetCouponsQueryHandler;
