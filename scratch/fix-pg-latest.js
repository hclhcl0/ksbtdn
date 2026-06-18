import { Client } from 'pg';

async function fixLatest() {
  const client = new Client({
    connectionString: 'postgres://postgres:E5nLuJvHdlKN68ni7UegmFWkvwq0d0mLdpuC8kCrWcQjHcTo7Ch7QMHcbGwa3AVd@127.0.0.1:65432/postgres'
  });
  await client.connect();
  
  console.log("Fixing latest=true for _articles_v...");
  await client.query(`
    UPDATE _articles_v 
    SET latest = true 
    WHERE id IN (
      SELECT id 
      FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY updated_at DESC) as rn 
        FROM _articles_v
      ) t 
      WHERE t.rn = 1
    )
  `);

  const res = await client.query(`SELECT count(*) as c FROM _articles_v WHERE latest = true`);
  console.log(`_articles_v with latest=true:`, res.rows[0].c);
  
  await client.end();
}

fixLatest().catch(console.error);
