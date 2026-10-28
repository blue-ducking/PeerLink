const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

router.get('/services', searchController.searchServices);

module.exports = router;
