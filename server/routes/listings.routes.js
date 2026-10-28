const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listings.controller');
const { requireAuth, requireVerified } = require('../middleware/auth.middleware');
const { validateListing } = require('../middleware/validation.middleware');

router.get('/', listingsController.listListings);
router.get('/:id', listingsController.getListingById);
router.post('/', requireAuth, requireVerified, validateListing, listingsController.createListing);
router.put('/:id', requireAuth, validateListing, listingsController.updateListing);
router.delete('/:id', requireAuth, listingsController.deleteListing);

module.exports = router;
