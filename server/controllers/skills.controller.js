const db = require('../config/database');

/**
 * List all available skills in master catalog.
 */
async function listSkills(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT s.skill_id, s.name, s.description, s.category_id, c.name AS category_name
       FROM skills s
       LEFT JOIN categories c ON s.category_id = c.category_id
       ORDER BY s.name ASC`
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * List all skill & listing categories.
 */
async function listCategories(req, res, next) {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * Get skills associated with the authenticated student.
 */
async function getMySkills(req, res, next) {
  try {
    const studentId = req.user.userId;
    const [rows] = await db.query(
      `SELECT s.skill_id, s.name, s.description, c.name AS category_name, ss.proficiency_level
       FROM skills s
       JOIN student_skills ss ON s.skill_id = ss.skill_id
       LEFT JOIN categories c ON s.category_id = c.category_id
       WHERE ss.student_id = ?
       ORDER BY s.name ASC`,
      [studentId]
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * Add a skill to student's profile.
 */
async function addStudentSkill(req, res, next) {
  try {
    const studentId = req.user.userId;
    const { skill_id, proficiency_level } = req.body;

    if (!skill_id || isNaN(Number(skill_id))) {
      return res.status(400).json({ success: false, error: 'A valid skill ID is required.' });
    }

    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    const level = validLevels.includes(proficiency_level) ? proficiency_level : 'INTERMEDIATE';

    await db.query(
      `INSERT INTO student_skills (student_id, skill_id, proficiency_level)
       VALUES (?, ?, ?)`,
      [studentId, Number(skill_id), level]
    );

    return res.status(201).json({
      success: true,
      message: 'Skill attached to your student profile successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove a skill from student profile.
 */
async function removeStudentSkill(req, res, next) {
  try {
    const studentId = req.user.userId;
    const skillId = Number(req.params.id);

    const [result] = await db.query(
      'DELETE FROM student_skills WHERE student_id = ? AND skill_id = ?',
      [studentId, skillId]
    );

    return res.status(200).json({
      success: true,
      message: 'Skill removed from student profile.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listSkills,
  listCategories,
  getMySkills,
  addStudentSkill,
  removeStudentSkill
};
