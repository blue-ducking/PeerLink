const db = require('../config/database');

/**
 * Foundation for searching peer service offerings.
 * Parameterized search across title, description, skill name, and category.
 */
async function searchServices(req, res, next) {
  try {
    const queryTerm = (req.query.q || '').trim();

    if (!queryTerm) {
      // If query is empty, return latest active listings
      const [rows] = await db.query(
        `SELECT l.listing_id, l.provider_id, l.title, l.description, l.availability,
                l.price, l.is_free, l.status, l.created_at,
                u.university_id,
                p.name AS provider_name, p.department AS provider_department, p.year AS provider_year,
                c.name AS category_name, s.name AS skill_name
         FROM service_listings l
         JOIN users u ON l.provider_id = u.user_id
         JOIN student_profiles p ON u.user_id = p.user_id
         JOIN categories c ON l.category_id = c.category_id
         LEFT JOIN skills s ON l.skill_id = s.skill_id
         WHERE l.status = 'ACTIVE'
         ORDER BY l.created_at DESC
         LIMIT 30`
      );
      return res.status(200).json({ success: true, count: rows.length, query: '', data: rows });
    }

    const pattern = `%${queryTerm}%`;

    const sql = `
      SELECT l.listing_id, l.provider_id, l.title, l.description, l.availability,
             l.price, l.is_free, l.status, l.created_at,
             u.university_id,
             p.name AS provider_name, p.department AS provider_department, p.year AS provider_year,
             c.name AS category_name, s.name AS skill_name
      FROM service_listings l
      JOIN users u ON l.provider_id = u.user_id
      JOIN student_profiles p ON u.user_id = p.user_id
      JOIN categories c ON l.category_id = c.category_id
      LEFT JOIN skills s ON l.skill_id = s.skill_id
      WHERE l.status = 'ACTIVE'
        AND (
          l.title LIKE ?
          OR l.description LIKE ?
          OR s.name LIKE ?
          OR c.name LIKE ?
        )
      ORDER BY l.created_at DESC
      LIMIT 50
    `;

    const [rows] = await db.query(sql, [pattern, pattern, pattern, pattern]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      query: queryTerm,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  searchServices
};
