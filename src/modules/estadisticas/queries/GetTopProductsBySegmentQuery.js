class GetTopProductsBySegmentQuery {
  constructor(params = {}) {
    this.segmento = params.segmento || 'edad';
    this.valor = params.valor;
  }
}

module.exports = GetTopProductsBySegmentQuery;
