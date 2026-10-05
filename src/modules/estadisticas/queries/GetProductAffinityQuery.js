class GetProductAffinityQuery {
  constructor(params = {}) {
    this.producto_id = params.producto_id;
    this.loyverse_handle = params.loyverse_handle;
    this.variant_id = params.variant_id;
  }
}

module.exports = GetProductAffinityQuery;
