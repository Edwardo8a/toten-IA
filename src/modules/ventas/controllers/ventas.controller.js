const queryBus = require('../../../core/bus/queryBus');
const GetReceiptsQuery = require('../queries/GetReceiptsQuery');
const GetSalesSummaryQuery = require('../queries/GetSalesSummaryQuery');

class VentasController {
  async listar(req, res, next) {
    try {
      const query = new GetReceiptsQuery(req.query);
      const result = await queryBus.execute(query);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async resumen(req, res, next) {
    try {
      const query = new GetSalesSummaryQuery(req.query);
      const result = await queryBus.execute(query);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new VentasController();
