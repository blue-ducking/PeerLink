const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, profileController.getProfile);
router.get('/:id', requireAuth, profileController.getProfile);
router.put('/', requireAuth, profileController.updateProfile);
router.put('/:id', requireAuth, profileController.updateProfile);

module.exports = router;
