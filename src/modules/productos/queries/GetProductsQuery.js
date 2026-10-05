class GetProductsQuery {
  constructor(params = {}) {
    this.categoria = params.categoria;
    this.activo = params.activo;
  }
}

module.exports = GetProductsQuery;
