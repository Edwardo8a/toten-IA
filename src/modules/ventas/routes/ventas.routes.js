const { Router } = require('express');
const ventasController = require('../controllers/ventas.controller');
const { requireAuth } = require('../../../middlewares/auth');

const router = Router();

router.use(requireAuth);

router.get('/', ventasController.listar.bind(ventasController));
router.get('/resumen', ventasController.resumen.bind(ventasController));

module.exports = router;
