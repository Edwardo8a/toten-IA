const queryBus = require('../../../core/bus/queryBus');
const GetTopProductsBySegmentQuery = require('../queries/GetTopProductsBySegmentQuery');
const GetProductAffinityQuery = require('../queries/GetProductAffinityQuery');

class EstadisticasController {
  async topProductos(req, res, next) {
    try {
      const query = new GetTopProductsBySegmentQuery(req.query);
      const result = await queryBus.execute(query);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async afinidad(req, res, next) {
    try {
      const query = new GetProductAffinityQuery(req.query);
      const result = await queryBus.execute(query);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EstadisticasController();
