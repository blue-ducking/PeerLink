const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../server/config/database');

test('Database Foundation — Relational Structure & Seed Integrity', async (t) => {
  await t.test('Database connection test succeeds', async () => {
    const status = await db.testConnection();
    assert.equal(status.ok, true);
    assert.ok(status.mode === 'mysql' || status.mode === 'mock');
  });

  await t.test('Users table contains verified and pending accounts', async () => {
    const [users] = await db.query('SELECT * FROM users');
    assert.ok(users.length >= 6);

    const verified = users.filter(u => u.verification_status === 'VERIFIED');
    const pending = users.filter(u => u.verification_status === 'PENDING');
    assert.ok(verified.length > 0, 'Must have verified accounts');
    assert.ok(pending.length > 0, 'Must have pending verification accounts');
  });

  await t.test('Categories and skills relationships exist', async () => {
    const [categories] = await db.query('SELECT * FROM categories');
    assert.ok(categories.length >= 10, 'Expected 10 categories');

    const [skills] = await db.query('SELECT * FROM skills');
    assert.ok(skills.length >= 10, 'Expected 10 skills');
  });

  await t.test('M:N Student Skills junction table maps correctly', async () => {
    // Alex Kumar is user_id 2
    const [studentSkills] = await db.query(
      `SELECT s.name, ss.proficiency_level
       FROM skills s
       JOIN student_skills ss ON s.skill_id = ss.skill_id
       WHERE ss.student_id = ?`,
      [2]
    );

    assert.ok(studentSkills.length >= 2, 'Alex should have at least 2 mapped skills');
    const hasPython = studentSkills.some(s => s.name.includes('Python'));
    assert.equal(hasPython, true, 'Alex should have Python skill mapped');
  });

  await t.test('Service listings are correctly linked to providers and categories', async () => {
    const [listings] = await db.query('SELECT * FROM service_listings WHERE status = "ACTIVE"');
    assert.ok(listings.length >= 4);
    listings.forEach(l => {
      assert.ok(l.provider_id, 'Listing must have a provider');
      assert.ok(l.category_id, 'Listing must have a category');
      assert.ok(l.title, 'Listing must have a title');
    });
  });
});
