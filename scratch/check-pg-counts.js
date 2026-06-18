import { Client } from 'pg';

async function checkPg() {
  const client = new Client({
    connectionString: 'postgres://postgres:E5nLuJvHdlKN68ni7UegmFWkvwq0d0mLdpuC8kCrWcQjHcTo7Ch7QMHcbGwa3AVd@127.0.0.1:65432/postgres'
  });
  await client.connect();
  const res1 = await client.query(`SELECT count(*) as c FROM articles`);
  const res2 = await client.query(`SELECT count(*) as c FROM _articles_v`);
  
  console.log(`articles in Postgres:`, res1.rows[0].c);
  console.log(`_articles_v in Postgres:`, res2.rows[0].c);
  
  if (res1.rows[0].c > 0) {
     const sample = await client.query(`SELECT id, title, _status FROM articles LIMIT 1`);
     console.log('Sample article:', sample.rows[0]);
  }
  
  await client.end();
}

checkPg().catch(console.error);
