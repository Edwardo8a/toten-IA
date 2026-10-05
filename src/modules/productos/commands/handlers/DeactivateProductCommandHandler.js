const supabase = require('../../../../config/supabaseClient');
const AppError = require('../../../../core/errors/AppError');

class DeactivateProductCommandHandler {
  async execute(command) {
    const { id } = command;

    const { data, error } = await supabase
      .from('productos')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError(`Error al desactivar producto: ${error.message}`, 500);
    }

    return {
      success: true,
      message: 'Producto desactivado correctamente (baja lógica).',
      producto: data
    };
  }
}

module.exports = DeactivateProductCommandHandler;
