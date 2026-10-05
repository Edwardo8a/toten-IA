const commandBus = require('../../../core/bus/commandBus');
const queryBus = require('../../../core/bus/queryBus');

const CreateProductCommand = require('../commands/CreateProductCommand');
const UpdateProductCommand = require('../commands/UpdateProductCommand');
const DeactivateProductCommand = require('../commands/DeactivateProductCommand');

const GetProductsQuery = require('../queries/GetProductsQuery');
const GetProductByIdQuery = require('../queries/GetProductByIdQuery');

class ProductosController {
  // ── Queries (Lecturas) ─────────────────────────────────────────────
  async listar(req, res, next) {
    try {
      const query = new GetProductsQuery(req.query);
      const productos = await queryBus.execute(query);
      return res.json(productos);
    } catch (err) {
      next(err);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const query = new GetProductByIdQuery(req.params.id);
      const producto = await queryBus.execute(query);
      return res.json(producto);
    } catch (err) {
      next(err);
    }
  }

  // ── Commands (Mutaciones) ──────────────────────────────────────────
  async crear(req, res, next) {
    try {
      const command = new CreateProductCommand(req.body);
      const result = await commandBus.dispatch(command);
      const status = result.loyverse_sync ? 201 : 207;
      return res.status(status).json(result);
    } catch (err) {
      next(err);
    }
  }

  async actualizar(req, res, next) {
    try {
      const command = new UpdateProductCommand(req.params.id, req.body);
      const result = await commandBus.dispatch(command);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async desactivar(req, res, next) {
    try {
      const command = new DeactivateProductCommand(req.params.id);
      const result = await commandBus.dispatch(command);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductosController();
