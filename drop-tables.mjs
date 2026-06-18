import pg from 'pg';
const { Pool } = pg;

const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL || "postgres://postgres:123456@127.0.0.1:5433/webcq";

const pool = new Pool({
  connectionString: dbUrl,
});

async function dropOldTables() {
  const client = await pool.connect();
  try {
    await client.query(`DROP SCHEMA public CASCADE;`);
    await client.query(`CREATE SCHEMA public;`);
    await client.query(`GRANT ALL ON SCHEMA public TO postgres;`);
    await client.query(`GRANT ALL ON SCHEMA public TO public;`);
    console.log(`Database completely wiped clean!`);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

dropOldTables();
