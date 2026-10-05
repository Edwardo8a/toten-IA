const queryBus = require('../../../core/bus/queryBus');
const GetCouponsQuery = require('../queries/GetCouponsQuery');
const GetClientStatsQuery = require('../queries/GetClientStatsQuery');

class CuponesController {
  async listar(req, res, next) {
    try {
      const query = new GetCouponsQuery(req.query);
      const result = await queryBus.execute(query);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async clientesStats(req, res, next) {
    try {
      const query = new GetClientStatsQuery();
      const result = await queryBus.execute(query);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CuponesController();
