const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../../../middlewares/auth');

const router = Router();

router.post('/login', authController.login.bind(authController));
router.get('/me', requireAuth, authController.me.bind(authController));

module.exports = router;
