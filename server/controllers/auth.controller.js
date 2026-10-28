const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'peerlink_super_secure_jwt_dev_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

/**
 * Register a new student account.
 */
async function register(req, res, next) {
  try {
    const { university_id, password, name, department, year } = req.body;

    // Check duplicate university_id
    const [existing] = await db.query(
      'SELECT user_id FROM users WHERE university_id = ?',
      [university_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: `University ID "${university_id}" is already registered.`
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Default status: PENDING
    const role = 'student';
    const verification_status = 'PENDING';

    const [userResult] = await db.query(
      'INSERT INTO users (university_id, password_hash, role, verification_status) VALUES (?, ?, ?, ?)',
      [university_id, password_hash, role, verification_status]
    );

    const newUserId = userResult.insertId;

    // Initialize 1:1 Student Profile
    await db.query(
      'INSERT INTO student_profiles (user_id, name, department, year, bio) VALUES (?, ?, ?, ?, ?)',
      [
        newUserId,
        name || `Student ${university_id}`,
        department || null,
        year ? Number(year) : null,
        'Welcome to my PeerLink profile.'
      ]
    );

    const tokenPayload = {
      userId: newUserId,
      universityId: university_id,
      role,
      verificationStatus: verification_status
    };

    const token = createToken(tokenPayload);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Verification status is PENDING.',
      data: {
        token,
        user: {
          userId: newUserId,
          universityId: university_id,
          role,
          verificationStatus: verification_status,
          name: name || `Student ${university_id}`
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Log in with University ID and Password.
 */
async function login(req, res, next) {
  try {
    const { university_id, password } = req.body;

    const [rows] = await db.query(
      'SELECT user_id, university_id, password_hash, role, verification_status FROM users WHERE university_id = ?',
      [university_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid University ID or password.'
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid University ID or password.'
      });
    }

    // Fetch profile name
    const [profiles] = await db.query(
      'SELECT name FROM student_profiles WHERE user_id = ?',
      [user.user_id]
    );
    const profileName = profiles.length > 0 ? profiles[0].name : user.university_id;

    const tokenPayload = {
      userId: user.user_id,
      universityId: user.university_id,
      role: user.role,
      verificationStatus: user.verification_status
    };

    const token = createToken(tokenPayload);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      data: {
        token,
        user: {
          userId: user.user_id,
          universityId: user.university_id,
          role: user.role,
          verificationStatus: user.verification_status,
          name: profileName
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout current session.
 */
async function logout(req, res) {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}

/**
 * Retrieve current authenticated session identity.
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.userId;

    const [users] = await db.query(
      'SELECT user_id, university_id, role, verification_status, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const [profiles] = await db.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        user: users[0],
        profile: profiles[0] || null
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Administrator verification update (PENDING -> VERIFIED / REJECTED).
 */
async function verifyUser(req, res, next) {
  try {
    const targetUserId = Number(req.params.id);
    const { status } = req.body;

    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be PENDING, VERIFIED, or REJECTED.'
      });
    }

    const [result] = await db.query(
      'UPDATE users SET verification_status = ? WHERE user_id = ?',
      [status, targetUserId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Target user not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `User ${targetUserId} status updated to ${status}.`,
      data: { userId: targetUserId, status }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * List all users (Administrator tool for review).
 */
async function listUsers(req, res, next) {
  try {
    const [rows] = await db.query('SELECT user_id, university_id, role, verification_status, created_at FROM users');
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  verifyUser,
  listUsers
};
