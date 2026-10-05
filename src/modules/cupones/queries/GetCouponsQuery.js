class GetCouponsQuery {
  constructor(params = {}) {
    this.estado = params.estado;
    this.limit = params.limit ? parseInt(params.limit, 10) : 100;
  }
}

module.exports = GetCouponsQuery;
