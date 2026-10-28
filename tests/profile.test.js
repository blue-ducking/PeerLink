const test = require('node:test');
const assert = require('node:assert/strict');
const profileController = require('../server/controllers/profile.controller');

function createMockReqRes(body = {}, params = {}, user = null) {
  const req = { body, params, headers: {}, user, cookies: {} };
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
    get statusCode() { return statusCode; },
    get data() { return responseData; }
  };

  return { req, res };
}

test('Profile Module — Authorization & IDOR Protection', async (t) => {
  await t.test('Student can retrieve own profile with associated skills', async () => {
    // Alex Kumar is user_id 2
    const { req, res } = createMockReqRes({}, { id: '2' }, { userId: 2, role: 'student' });

    await profileController.getProfile(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.name, 'Alex Kumar');
    assert.ok(Array.isArray(res.data.data.skills), 'Profile includes skills array');
  });

  await t.test('STRICT IDOR: Rejects student attempting to update another student profile', async () => {
    // Sarah (user_id 3) tries to modify Alex's profile (user_id 2)
    const { req, res } = createMockReqRes(
      { name: 'Hacked Name', department: 'Malicious', year: 4, bio: 'Unauthorized' },
      { id: '2' },
      { userId: 3, role: 'student' } // Authenticated as user 3
    );

    await profileController.updateProfile(req, res, () => {});

    assert.equal(res.statusCode, 403, 'Must return 403 Forbidden on IDOR violation');
    assert.equal(res.data.success, false);
    assert.match(res.data.error, /permission/i);
  });

  await t.test('Student can legitimately update their own profile', async () => {
    // Alex (user_id 2) updates his own profile
    const { req, res } = createMockReqRes(
      { name: 'Alex Kumar', department: 'Computer Science & AI', year: 3, bio: 'Updated bio for senior year.' },
      { id: '2' },
      { userId: 2, role: 'student' }
    );

    await profileController.updateProfile(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.department, 'Computer Science & AI');
  });
});
