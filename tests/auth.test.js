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

    await authController.register(req, res, () => {});

    assert.equal(res.statusCode, 201, 'Should return 201 Created');
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.user.verificationStatus, 'PENDING', 'New registration must start as PENDING');
    assert.equal(res.data.data.user.role, 'student');
    assert.ok(res.data.data.token, 'Should return authenticated session token');

    // Verify password is not stored plaintext
    const [rows] = await db.query('SELECT password_hash FROM users WHERE university_id = ?', [uniId]);
    assert.notEqual(rows[0].password_hash, 'SecurePassword123!');
    const isBcrypt = await bcrypt.compare('SecurePassword123!', rows[0].password_hash);
    assert.equal(isBcrypt, true, 'Stored hash must be valid bcrypt');
  });

  await t.test('Rejects duplicate university ID registration with 409 Conflict', async () => {
    const { req, res } = createMockReqRes({
      university_id: 'STU1001', // Existing seeded student
      password: 'AnyPassword123!',
      name: 'Duplicate Student'
    });

    await authController.register(req, res, () => {});

    assert.equal(res.statusCode, 409, 'Should return 409 Conflict on duplicate ID');
    assert.equal(res.data.success, false);
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
  await t.test('Admin can list users with enriched student profile metadata', async () => {
    const { req, res } = createMockReqRes({}, {}, {}, { userId: 1, role: 'admin' });

    await authController.listUsers(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    assert.ok(res.data.data.length >= 6);

    const priya = res.data.data.find(u => u.university_id === 'STU1004');
    assert.ok(priya);
    assert.equal(priya.name, 'Priya Sharma');
    assert.equal(priya.department, 'Electronics & Communication');
    assert.equal(priya.verification_status, 'PENDING');
  });

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

  await t.test('Rejects invalid status update with 400 Bad Request', async () => {
    const { req, res } = createMockReqRes(
      { status: 'SUPER_VERIFIED_INVALID' },
      { id: '5' },
      {},
      { userId: 1, role: 'admin' }
    );

    await authController.verifyUser(req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.data.success, false);
  });

  await t.test('Returns 404 when target user does not exist', async () => {
    const { req, res } = createMockReqRes(
      { status: 'VERIFIED' },
      { id: '999999' },
      {},
      { userId: 1, role: 'admin' }
    );

    await authController.verifyUser(req, res, () => {});

    assert.equal(res.statusCode, 404);
    assert.equal(res.data.success, false);
  });
});
