import { Client } from 'pg';

async function checkPg() {
  const client = new Client({
    connectionString: 'postgres://postgres:E5nLuJvHdlKN68ni7UegmFWkvwq0d0mLdpuC8kCrWcQjHcTo7Ch7QMHcbGwa3AVd@127.0.0.1:65432/postgres'
  });
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = '_articles_v'
  `);
  console.log(res.rows);
  await client.end();
}

checkPg().catch(console.error);
