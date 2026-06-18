import { createClient } from '@libsql/client';

async function describeTable() {
  const client = createClient({
    url: 'file:D:/CDC/webcq/payload-data.db'
  });

  const articles = await client.execute('PRAGMA table_info(articles)');
  console.log('Columns in articles:');
  console.log(articles.rows.map(r => r.name));
}

describeTable().catch(console.error);
