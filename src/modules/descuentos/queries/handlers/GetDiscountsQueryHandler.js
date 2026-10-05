const loyverseClient = require('../../../../config/loyverseClient');

class GetDiscountsQueryHandler {
  async execute(query) {
    const res = await loyverseClient.get('/discounts', query.params);
    return res?.discounts || [];
  }
}

module.exports = GetDiscountsQueryHandler;
