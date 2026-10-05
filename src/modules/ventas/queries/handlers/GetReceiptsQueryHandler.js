const loyverseClient = require('../../../../config/loyverseClient');

class GetReceiptsQueryHandler {
  async execute(query) {
    const { created_at_min, created_at_max, store_id, cursor, limit, auto_paginate } = query;

    // Loyverse Free Tier requiere created_at_min <= 31 días atrás
    const defaultMin = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString();
    const effectiveMin = created_at_min || defaultMin;

    if (auto_paginate) {
      const allReceipts = [];
      let nextCursor = null;
      let pages = 0;
      const maxPages = 15;

      while (pages < maxPages) {
        const p = { limit: limit || 250, created_at_min: effectiveMin };
        if (created_at_max) p.created_at_max = created_at_max;
        if (store_id) p.store_id = store_id;
        if (nextCursor) p.cursor = nextCursor;

        const data = await loyverseClient.get('/receipts', p);
        const receipts = data?.receipts || [];
        allReceipts.push(...receipts);
        pages++;

        nextCursor = data?.cursor;
        if (!nextCursor || receipts.length === 0) break;
      }

      return {
        total_recibos: allReceipts.length,
        receipts: allReceipts
      };
    }

    const params = {
      created_at_min: effectiveMin
    };
    if (created_at_max) params.created_at_max = created_at_max;
    if (store_id) params.store_id = store_id;
    if (cursor) params.cursor = cursor;
    if (limit) params.limit = limit;

    return await loyverseClient.get('/receipts', params);
  }
}

module.exports = GetReceiptsQueryHandler;
