class GetSalesSummaryQuery {
  constructor(params = {}) {
    this.created_at_min = params.created_at_min;
    this.created_at_max = params.created_at_max;
    this.store_id = params.store_id;
  }
}

module.exports = GetSalesSummaryQuery;
