const db = require('../config/database');

/**
 * Get profile for a specific student or current authenticated user.
 */
async function getProfile(req, res, next) {
  try {
    const targetUserId = req.params.id ? Number(req.params.id) : req.user.userId;

    if (isNaN(targetUserId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID.' });
    }

    const [rows] = await db.query(
      `SELECT p.profile_id, p.user_id, p.name, p.department, p.year, p.bio, p.profile_image, p.created_at,
              u.university_id, u.verification_status, u.role
       FROM student_profiles p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.user_id = ?`,
      [targetUserId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }

    const profile = rows[0];

    // Fetch student's associated skills
    const [skills] = await db.query(
      `SELECT s.skill_id, s.name, s.description, c.name AS category_name, ss.proficiency_level
       FROM skills s
       JOIN student_skills ss ON s.skill_id = ss.skill_id
       LEFT JOIN categories c ON s.category_id = c.category_id
       WHERE ss.student_id = ?`,
      [targetUserId]
    );

    // Fetch active service listings by this student
    const [listings] = await db.query(
      `SELECT l.listing_id, l.title, l.description, l.availability, l.price, l.is_free, l.status,
              c.name AS category_name, s.name AS skill_name
       FROM service_listings l
       JOIN categories c ON l.category_id = c.category_id
       LEFT JOIN skills s ON l.skill_id = s.skill_id
       WHERE l.provider_id = ? AND l.status = 'ACTIVE'`,
      [targetUserId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...profile,
        skills,
        listings
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update student profile.
 * STRICT IDOR PROTECTION: Users may only update their own profile.
 */
async function updateProfile(req, res, next) {
  try {
    const targetUserId = req.params.id ? Number(req.params.id) : req.user.userId;

    // IDOR verification check
    if (req.user.userId !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to modify another student’s profile.'
      });
    }

    const { name, department, year, bio } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Name cannot be empty.' });
    }

    const [result] = await db.query(
      `UPDATE student_profiles
       SET name = ?, department = ?, year = ?, bio = ?
       WHERE user_id = ?`,
      [
        name.trim(),
        department ? department.trim() : null,
        year ? Number(year) : null,
        bio ? bio.trim() : null,
        targetUserId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found to update.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user_id: targetUserId,
        name: name.trim(),
        department,
        year,
        bio
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile
};
