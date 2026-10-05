const supabase = require('../../../../config/supabaseClient');
const AppError = require('../../../../core/errors/AppError');

class GetProductByIdQueryHandler {
  async execute(query) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', query.id)
      .single();

    if (error || !data) {
      throw new AppError(`Producto con ID ${query.id} no encontrado.`, 404);
    }
    return data;
  }
}

module.exports = GetProductByIdQueryHandler;
