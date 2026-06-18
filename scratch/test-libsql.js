import { createClient } from '@libsql/client';

async function fetchFromLibSql() {
  const client = createClient({
    url: 'file:D:/CDC/webcq/payload-data.db'
  });

  const articles = await client.execute('SELECT * FROM articles LIMIT 20');
  console.log(`Found ${articles.rows.length} articles via libsql!`);
}

fetchFromLibSql().catch(console.error);
