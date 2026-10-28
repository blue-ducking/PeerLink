const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin } = require('../middleware/validation.middleware');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);

// Admin-only user review and verification routes
router.get('/users', requireAuth, requireAdmin, authController.listUsers);
router.patch('/users/:id/verify', requireAuth, requireAdmin, authController.verifyUser);

module.exports = router;
