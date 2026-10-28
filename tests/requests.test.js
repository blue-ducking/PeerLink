const test = require('node:test');
const assert = require('node:assert/strict');
const requestsController = require('../server/controllers/requests.controller');

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

test('Service Requests Module — Flow & Access Control', async (t) => {
  let createdRequestId = null;

  await t.test('Student can send a service request for an active listing', async () => {
    // Sarah (user 3) requests Alex's Python listing (listing_id 1, provider 2)
    const { req, res } = createMockReqRes(
      {
        listing_id: 1,
        message: 'Hello Alex, I would appreciate 30 minutes of Python debugging guidance.'
      },
      {},
      { userId: 3, role: 'student', verificationStatus: 'VERIFIED' }
    );

    await requestsController.createRequest(req, res, () => {});

    assert.equal(res.statusCode, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.status, 'PENDING');
    createdRequestId = res.data.data.request_id;
  });

  await t.test('Cannot request own service listing', async () => {
    // Alex (user 2) tries to request his own listing (listing 1)
    const { req, res } = createMockReqRes(
      {
        listing_id: 1,
        message: 'Requesting my own service'
      },
      {},
      { userId: 2, role: 'student', verificationStatus: 'VERIFIED' }
    );

    await requestsController.createRequest(req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.data.success, false);
    assert.match(res.data.error, /cannot request your own/i);
  });

  await t.test('STRICT IDOR: Unauthorized user cannot accept someone else’s request', async () => {
    // Joel (user 4) tries to accept the request that was sent to Alex (user 2)
    const { req, res } = createMockReqRes(
      {},
      { id: String(createdRequestId) },
      { userId: 4, role: 'student' }
    );

    await requestsController.acceptRequest(req, res, () => {});

    assert.equal(res.statusCode, 403, 'Must return 403 Forbidden');
    assert.equal(res.data.success, false);
  });

  await t.test('Designated provider can accept the service request', async () => {
    // Alex (user 2, the actual provider) accepts the request
    const { req, res } = createMockReqRes(
      {},
      { id: String(createdRequestId) },
      { userId: 2, role: 'student' }
    );

    await requestsController.acceptRequest(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.status, 'ACCEPTED');
  });
});
