const { Router } = require('express');
const estadisticasController = require('../controllers/estadisticas.controller');
const { requireAuth } = require('../../../middlewares/auth');

const router = Router();

router.use(requireAuth);

router.get('/top-productos', estadisticasController.topProductos.bind(estadisticasController));
router.get('/afinidad', estadisticasController.afinidad.bind(estadisticasController));

module.exports = router;
