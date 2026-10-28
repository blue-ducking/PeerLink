const test = require('node:test');
const assert = require('node:assert/strict');
const listingsController = require('../server/controllers/listings.controller');

function createMockReqRes(body = {}, params = {}, query = {}, user = null) {
  const req = { body, params, query, headers: {}, user, cookies: {} };
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

test('Listings Module — Creation & Authorization', async (t) => {
  let createdListingId = null;

  await t.test('Verified student can create a new service listing', async () => {
    // Sarah (user_id 3) posts a tutoring listing
    const { req, res } = createMockReqRes(
      {
        category_id: 3, // Academic
        skill_id: 7,    // Discrete Math
        title: 'Discrete Mathematics Proof Tutoring',
        description: 'Assisting students with induction proofs and truth tables.',
        availability: 'Wednesday afternoons',
        price: 0.00,
        is_free: true
      },
      {},
      {},
      { userId: 3, role: 'student', verificationStatus: 'VERIFIED' }
    );

    await listingsController.createListing(req, res, () => {});

    assert.equal(res.statusCode, 201);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.listing_id);
    createdListingId = res.data.data.listing_id;
  });

  await t.test('STRICT IDOR: Another student cannot delete Sarah’s listing', async () => {
    // Joel (user_id 4) attempts to delete Sarah's listing
    const { req, res } = createMockReqRes(
      {},
      { id: String(createdListingId) },
      {},
      { userId: 4, role: 'student' }
    );

    await listingsController.deleteListing(req, res, () => {});

    assert.equal(res.statusCode, 403, 'Must reject unauthorized deletion with 403 Forbidden');
    assert.equal(res.data.success, false);
  });

  await t.test('Owner can successfully delete their own listing', async () => {
    // Sarah (user_id 3) deletes her listing
    const { req, res } = createMockReqRes(
      {},
      { id: String(createdListingId) },
      {},
      { userId: 3, role: 'student' }
    );

    await listingsController.deleteListing(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
  });
});
