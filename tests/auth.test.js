const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const db = require('../server/config/database');
const authController = require('../server/controllers/auth.controller');

// Mock request / response helper
function createMockReqRes(body = {}, params = {}, headers = {}, user = null) {
  const req = { body, params, headers, user, cookies: {} };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    cookie() {},
    clearCookie() {},
    get statusCode() { return statusCode; },
    get data() { return responseData; }
  };

  return { req, res };
}

test('Auth Module — Registration & Password Hashing', async (t) => {
  await t.test('Successfully registers a new student with PENDING verification', async () => {
    const uniId = `TEST_${Date.now()}`;
    const { req, res } = createMockReqRes({
      university_id: uniId,
      password: 'SecurePassword123!',
      name: 'Test Student',
      department: 'Computer Science',
      year: 2
    });

    let nextCalled = false;
    await authController.register(req, res, (err) => { nextCalled = true; });

    assert.equal(res.statusCode, 201, 'Should return 201 Created');
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.user.verificationStatus, 'PENDING');
    assert.equal(res.data.data.user.universityId, uniId);
    assert.ok(res.data.data.token, 'Should return a valid JWT token');

    // Verify password is NOT stored as plain text
    const [rows] = await db.query('SELECT password_hash FROM users WHERE university_id = ?', [uniId]);
    assert.equal(rows.length, 1);
    assert.notEqual(rows[0].password_hash, 'SecurePassword123!');
    const isBcryptMatch = await bcrypt.compare('SecurePassword123!', rows[0].password_hash);
    assert.equal(isBcryptMatch, true, 'Stored hash must verify against bcrypt');
  });

  await t.test('Rejects duplicate university ID registration with 409 Conflict', async () => {
    const { req, res } = createMockReqRes({
      university_id: 'STU1001', // Already seeded
      password: 'Password123!',
      name: 'Duplicate Student'
    });

    await authController.register(req, res, () => {});

    assert.equal(res.statusCode, 409, 'Should return 409 Conflict for duplicate ID');
    assert.equal(res.data.success, false);
    assert.match(res.data.error, /already registered/i);
  });
});

test('Auth Module — Login & Credentials', async (t) => {
  await t.test('Successful login with valid credentials', async () => {
    const { req, res } = createMockReqRes({
      university_id: 'STU1001',
      password: 'Password123!'
    });

    await authController.login(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.token);
    assert.equal(res.data.data.user.universityId, 'STU1001');
    assert.equal(res.data.data.user.verificationStatus, 'VERIFIED');
  });

  await t.test('Rejects login with invalid password', async () => {
    const { req, res } = createMockReqRes({
      university_id: 'STU1001',
      password: 'WrongPassword999!'
    });

    await authController.login(req, res, () => {});

    assert.equal(res.statusCode, 401, 'Should return 401 Unauthorized');
    assert.equal(res.data.success, false);
  });

  await t.test('Rejects login for non-existent student ID', async () => {
    const { req, res } = createMockReqRes({
      university_id: 'NON_EXISTENT_9999',
      password: 'Password123!'
    });

    await authController.login(req, res, () => {});

    assert.equal(res.statusCode, 401, 'Should return 401 Unauthorized');
    assert.equal(res.data.success, false);
  });
});

test('Auth Module — Administrator Student Verification', async (t) => {
  await t.test('Admin can verify a pending student', async () => {
    // STU1004 (user_id 5) is seeded as PENDING
    const { req, res } = createMockReqRes(
      { status: 'VERIFIED' },
      { id: '5' },
      {},
      { userId: 1, role: 'admin' }
    );

    await authController.verifyUser(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.status, 'VERIFIED');

    // Confirm updated status in database
    const [rows] = await db.query('SELECT verification_status FROM users WHERE user_id = ?', [5]);
    assert.equal(rows[0].verification_status, 'VERIFIED');
  });
});
