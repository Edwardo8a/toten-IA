const { Router } = require('express');
const cuponesController = require('../controllers/cupones.controller');
const { requireAuth } = require('../../../middlewares/auth');

const router = Router();

// Rutas protegidas de cupones y clientes
router.get('/cupones', requireAuth, cuponesController.listar.bind(cuponesController));
router.get('/clientes/stats', requireAuth, cuponesController.clientesStats.bind(cuponesController));

module.exports = router;
