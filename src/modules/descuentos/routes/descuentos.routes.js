const { Router } = require('express');
const descuentosController = require('../controllers/descuentos.controller');
const { requireAuth } = require('../../../middlewares/auth');

const router = Router();

router.use(requireAuth);

router.get('/', descuentosController.listar.bind(descuentosController));
router.get('/:id', descuentosController.obtenerPorId.bind(descuentosController));
router.post('/', descuentosController.crear.bind(descuentosController));
router.put('/:id', descuentosController.actualizar.bind(descuentosController));
router.delete('/:id', descuentosController.eliminar.bind(descuentosController));

module.exports = router;
