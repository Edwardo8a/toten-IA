const supabase = require('../../../../config/supabaseClient');
const AppError = require('../../../../core/errors/AppError');

class GetProductsQueryHandler {
  async execute(query) {
    let q = supabase.from('productos').select('*');

    if (query.activo === 'false') {
      q = q.eq('activo', false);
    } else if (query.activo === 'all') {
      // mostrar todos
    } else {
      q = q.eq('activo', true);
    }

    if (query.categoria) {
      q = q.ilike('categoria', `%${query.categoria}%`);
    }

    q = q.order('categoria', { ascending: true }).order('nombre', { ascending: true });

    const { data, error } = await q;
    if (error) {
      throw new AppError(`Error al consultar productos: ${error.message}`, 500);
    }
    return data || [];
  }
}

module.exports = GetProductsQueryHandler;
