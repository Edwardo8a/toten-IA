const loyverseClient = require('../../../../config/loyverseClient');

class GetDiscountByIdQueryHandler {
  async execute(query) {
    const res = await loyverseClient.get(`/discounts/${query.id}`);
    return res;
  }
}

module.exports = GetDiscountByIdQueryHandler;
