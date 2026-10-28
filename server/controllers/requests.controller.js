const db = require('../config/database');

/**
 * List all service requests involving the current student (sent or received).
 */
async function listUserRequests(req, res, next) {
  try {
    const userId = req.user.userId;

    const [rows] = await db.query(
      `SELECT r.request_id, r.requester_id, r.listing_id, r.provider_id, r.message, r.status, r.created_at,
              l.title AS listing_title,
              prov_prof.name AS provider_name, prov_u.university_id AS provider_university_id,
              req_prof.name AS requester_name, req_u.university_id AS requester_university_id
       FROM service_requests r
       JOIN service_listings l ON r.listing_id = l.listing_id
       JOIN users prov_u ON r.provider_id = prov_u.user_id
       JOIN student_profiles prov_prof ON prov_u.user_id = prov_prof.user_id
       JOIN users req_u ON r.requester_id = req_u.user_id
       JOIN student_profiles req_prof ON req_u.user_id = req_prof.user_id
       WHERE r.requester_id = ? OR r.provider_id = ?
       ORDER BY r.created_at DESC`,
      [userId, userId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Submit a service request for a listing.
 * Authenticated user becomes the requester.
 */
async function createRequest(req, res, next) {
  try {
    const requesterId = req.user.userId;
    const { listing_id, message } = req.body;

    // Verify listing existence and obtain genuine provider_id from DB
    const [listings] = await db.query(
      'SELECT listing_id, provider_id, status FROM service_listings WHERE listing_id = ?',
      [Number(listing_id)]
    );

    if (listings.length === 0) {
      return res.status(404).json({ success: false, error: 'Target listing not found.' });
    }

    const listing = listings[0];

    if (listing.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Cannot request a listing that is not currently active.'
      });
    }

    // Prevent requesting own listing
    if (listing.provider_id === requesterId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot request your own service listing.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO service_requests (requester_id, listing_id, provider_id, message, status)
       VALUES (?, ?, ?, ?, 'PENDING')`,
      [requesterId, listing.listing_id, listing.provider_id, message.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Service request sent successfully. Status is PENDING provider review.',
      data: {
        request_id: result.insertId,
        listing_id: listing.listing_id,
        status: 'PENDING'
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Provider accepts a service request.
 * STRICT IDOR PROTECTION: Only the designated provider can accept.
 */
async function acceptRequest(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    const userId = req.user.userId;

    const [requests] = await db.query(
      'SELECT * FROM service_requests WHERE request_id = ?',
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, error: 'Request not found.' });
    }

    const request = requests[0];

    // Authorization check
    if (request.provider_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Only the service provider can accept this request.'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot accept request in status "${request.status}".`
      });
    }

    await db.query(
      'UPDATE service_requests SET status = "ACCEPTED" WHERE request_id = ?',
      [requestId]
    );

    return res.status(200).json({
      success: true,
      message: 'Service request accepted.',
      data: { request_id: requestId, status: 'ACCEPTED' }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Provider rejects a service request.
 * STRICT IDOR PROTECTION: Only the designated provider can reject.
 */
async function rejectRequest(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    const userId = req.user.userId;

    const [requests] = await db.query(
      'SELECT * FROM service_requests WHERE request_id = ?',
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, error: 'Request not found.' });
    }

    const request = requests[0];

    // Authorization check
    if (request.provider_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Only the service provider can reject this request.'
      });
    }

    await db.query(
      'UPDATE service_requests SET status = "REJECTED" WHERE request_id = ?',
      [requestId]
    );

    return res.status(200).json({
      success: true,
      message: 'Service request rejected.',
      data: { request_id: requestId, status: 'REJECTED' }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUserRequests,
  createRequest,
  acceptRequest,
  rejectRequest
};
