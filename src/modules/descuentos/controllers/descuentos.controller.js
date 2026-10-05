const commandBus = require('../../../core/bus/commandBus');
const queryBus = require('../../../core/bus/queryBus');

const CreateDiscountCommand = require('../commands/CreateDiscountCommand');
const UpdateDiscountCommand = require('../commands/UpdateDiscountCommand');
const DeleteDiscountCommand = require('../commands/DeleteDiscountCommand');

const GetDiscountsQuery = require('../queries/GetDiscountsQuery');
const GetDiscountByIdQuery = require('../queries/GetDiscountByIdQuery');

class DescuentosController {
  // ── Queries (Lecturas) ─────────────────────────────────────────────
  async listar(req, res, next) {
    try {
      const query = new GetDiscountsQuery(req.query);
      const descuentos = await queryBus.execute(query);
      return res.json(descuentos);
    } catch (err) {
      next(err);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const query = new GetDiscountByIdQuery(req.params.id);
      const descuento = await queryBus.execute(query);
      return res.json(descuento);
    } catch (err) {
      next(err);
    }
  }

  // ── Commands (Mutaciones) ──────────────────────────────────────────
  async crear(req, res, next) {
    try {
      const command = new CreateDiscountCommand(req.body);
      const result = await commandBus.dispatch(command);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async actualizar(req, res, next) {
    try {
      const command = new UpdateDiscountCommand(req.params.id, req.body);
      const result = await commandBus.dispatch(command);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async eliminar(req, res, next) {
    try {
      const command = new DeleteDiscountCommand(req.params.id);
      const result = await commandBus.dispatch(command);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DescuentosController();
