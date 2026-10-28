const express = require('express');
const router = express.Router();
const requestsController = require('../controllers/requests.controller');
const { requireAuth, requireVerified } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validation.middleware');

router.get('/', requireAuth, requestsController.listUserRequests);
router.post('/', requireAuth, requireVerified, validateRequest, requestsController.createRequest);
router.patch('/:id/accept', requireAuth, requestsController.acceptRequest);
router.patch('/:id/reject', requireAuth, requestsController.rejectRequest);

module.exports = router;
