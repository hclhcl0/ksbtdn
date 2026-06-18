import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URI });
pool.query("DELETE FROM categories WHERE slug IN ('van-de-suc-khoe', 'a-sung')").then(() => {
  console.log('Deleted');
  pool.end();
}).catch(console.error);
