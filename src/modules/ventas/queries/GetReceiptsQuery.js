class GetReceiptsQuery {
  constructor(params = {}) {
    this.created_at_min = params.created_at_min;
    this.created_at_max = params.created_at_max;
    this.store_id = params.store_id;
    this.cursor = params.cursor;
    this.limit = params.limit;
    this.auto_paginate = params.auto_paginate === 'true' || params.auto_paginate === true;
  }
}

module.exports = GetReceiptsQuery;
