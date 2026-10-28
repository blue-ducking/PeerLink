const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_NAME = 'peerlink_db',
  DB_USER = 'root',
  DB_PASSWORD = ''
} = process.env;

async function runSeed() {
  console.log(`Connecting to MySQL host ${DB_HOST}:${DB_PORT} as user "${DB_USER}"...`);

  // Step 1: Connect without database first to ensure peerlink_db exists
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true
    });
  } catch (err) {
    console.error('Failed to connect to MySQL:', err.message);
    process.exit(1);
  }

  try {
    console.log(`Ensuring database "${DB_NAME}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${DB_NAME}\`;`);

    // Step 2: Read schema.sql
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying database schema from database/schema.sql...');
    await connection.query(schemaSql);
    console.log('Schema applied successfully.');

    // Step 3: Read seed.sql
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('Populating demo data from database/seed.sql...');
    await connection.query(seedSql);
    console.log('Seed data inserted successfully.');

    console.log('Database initialization completed.');
  } catch (err) {
    console.error('Error executing seed scripts:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
