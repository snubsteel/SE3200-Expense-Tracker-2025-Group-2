import 'dotenv/config';
import pg from 'pg';

// Reuse a single Pool instance so every part of the app shares the same
// efficient connection pool instead of opening new clients per request.
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined. Please set it in your environment variables.');
}

// The Pool manages PostgreSQL connections for us and keeps idle clients ready
// to serve incoming queries, which is the recommended pattern in Node apps.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export default pool;
