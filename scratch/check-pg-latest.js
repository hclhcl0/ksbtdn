import { Client } from 'pg';

async function checkPg() {
  const client = new Client({
    connectionString: 'postgres://postgres:E5nLuJvHdlKN68ni7UegmFWkvwq0d0mLdpuC8kCrWcQjHcTo7Ch7QMHcbGwa3AVd@127.0.0.1:65432/postgres'
  });
  await client.connect();
  const res = await client.query(`SELECT count(*) as c FROM _articles_v WHERE latest = true`);
  
  console.log(`_articles_v with latest=true:`, res.rows[0].c);
  
  await client.end();
}

checkPg().catch(console.error);
