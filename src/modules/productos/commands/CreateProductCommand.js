class CreateProductCommand {
  constructor(payload = {}) {
    this.nombre = payload.nombre;
    this.categoria = payload.categoria;
    this.descripcion = payload.descripcion || '';
    this.precio = payload.precio ?? 0;
    this.costo = payload.costo ?? 0;
    this.etiquetas_demograficas = payload.etiquetas_demograficas || [];
    this.loyverse_handle = payload.loyverse_handle;
    this.loyverse_ref = payload.loyverse_ref;
  }
}

module.exports = CreateProductCommand;
