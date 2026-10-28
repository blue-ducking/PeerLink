const db = require('../config/database');

/**
 * Retrieve active service listings.
 */
async function listListings(req, res, next) {
  try {
    const { category_id, provider_id } = req.query;

    let sql = `
      SELECT l.listing_id, l.provider_id, l.skill_id, l.category_id, l.title, l.description,
             l.availability, l.price, l.is_free, l.status, l.created_at,
             u.university_id,
             p.name AS provider_name, p.department AS provider_department, p.year AS provider_year,
             c.name AS category_name,
             s.name AS skill_name
      FROM service_listings l
      JOIN users u ON l.provider_id = u.user_id
      JOIN student_profiles p ON u.user_id = p.user_id
      JOIN categories c ON l.category_id = c.category_id
      LEFT JOIN skills s ON l.skill_id = s.skill_id
      WHERE l.status = 'ACTIVE'
    `;

    const params = [];

    if (category_id) {
      sql += ' AND l.category_id = ?';
      params.push(Number(category_id));
    }

    if (provider_id) {
      sql += ' AND l.provider_id = ?';
      params.push(Number(provider_id));
    }

    sql += ' ORDER BY l.created_at DESC';

    const [rows] = await db.query(sql, params);
    return res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve single listing details.
 */
async function getListingById(req, res, next) {
  try {
    const listingId = Number(req.params.id);

    if (isNaN(listingId)) {
      return res.status(400).json({ success: false, error: 'Invalid listing ID.' });
    }

    const [rows] = await db.query(
      `SELECT l.listing_id, l.provider_id, l.skill_id, l.category_id, l.title, l.description,
              l.availability, l.price, l.is_free, l.status, l.created_at,
              u.university_id,
              p.name AS provider_name, p.department AS provider_department, p.year AS provider_year,
              c.name AS category_name,
              s.name AS skill_name
       FROM service_listings l
       JOIN users u ON l.provider_id = u.user_id
       JOIN student_profiles p ON u.user_id = p.user_id
       JOIN categories c ON l.category_id = c.category_id
       LEFT JOIN skills s ON l.skill_id = s.skill_id
       WHERE l.listing_id = ?`,
      [listingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new service listing.
 * Authenticated provider is extracted from verified JWT, never trusted from body.
 */
async function createListing(req, res, next) {
  try {
    const providerId = req.user.userId;
    const { skill_id, category_id, title, description, availability, price, is_free } = req.body;

    const [result] = await db.query(
      `INSERT INTO service_listings
       (provider_id, skill_id, category_id, title, description, availability, price, is_free, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [
        providerId,
        skill_id ? Number(skill_id) : null,
        Number(category_id),
        title.trim(),
        description.trim(),
        availability ? availability.trim() : 'Flexible schedule',
        price ? Number(price) : 0.00,
        is_free !== undefined ? (is_free === true || is_free === 'true') : true
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Service listing created successfully.',
      data: {
        listing_id: result.insertId,
        title: title.trim()
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing service listing.
 * STRICT IDOR PROTECTION: Only the provider can edit their listing.
 */
async function updateListing(req, res, next) {
  try {
    const listingId = Number(req.params.id);
    const userId = req.user.userId;

    const [existing] = await db.query(
      'SELECT provider_id FROM service_listings WHERE listing_id = ?',
      [listingId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }

    if (existing[0].provider_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this listing.'
      });
    }

    const { title, description, availability, price, is_free, status } = req.body;

    const [result] = await db.query(
      `UPDATE service_listings
       SET title = ?, description = ?, availability = ?, price = ?, is_free = ?, status = ?
       WHERE listing_id = ? AND provider_id = ?`,
      [
        title,
        description,
        availability || 'Flexible schedule',
        price ? Number(price) : 0.00,
        is_free !== undefined ? Boolean(is_free) : true,
        status || 'ACTIVE',
        listingId,
        existing[0].provider_id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Listing updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a service listing.
 * STRICT IDOR PROTECTION: Only owner or admin may delete.
 */
async function deleteListing(req, res, next) {
  try {
    const listingId = Number(req.params.id);
    const userId = req.user.userId;

    const [existing] = await db.query(
      'SELECT provider_id FROM service_listings WHERE listing_id = ?',
      [listingId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }

    if (existing[0].provider_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to delete this listing.'
      });
    }

    await db.query(
      'DELETE FROM service_listings WHERE listing_id = ? AND provider_id = ?',
      [listingId, existing[0].provider_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Listing deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
};
