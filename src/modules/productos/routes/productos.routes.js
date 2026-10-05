const { Router } = require('express');
const productosController = require('../controllers/productos.controller');
const { requireAuth } = require('../../../middlewares/auth');

const router = Router();

router.use(requireAuth);

router.get('/', productosController.listar.bind(productosController));
router.get('/:id', productosController.obtenerPorId.bind(productosController));
router.post('/', productosController.crear.bind(productosController));
router.put('/:id', productosController.actualizar.bind(productosController));
router.delete('/:id', productosController.desactivar.bind(productosController));

module.exports = router;
