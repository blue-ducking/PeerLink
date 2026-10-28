const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

router.post('/query', optionalAuth, aiController.queryAssistant);

module.exports = router;
