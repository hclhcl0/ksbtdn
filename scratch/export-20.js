import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';
import fs from 'fs';

async function exportArticles() {
  // Point to the old sqlite database
  process.env.SQLITE_URL = 'file:../payload-data.db';
  delete process.env.DATABASE_URI;

  const payload = await getPayload({
    config: configPromise,
  });

  console.log('Fetching 20 articles...');
  const result = await payload.find({
    collection: 'articles',
    limit: 20,
    depth: 1, // Populate relations like media and categories
  });

  const exportData = {
    articles: result.docs,
  };

  fs.writeFileSync('scratch/exported-20-articles.json', JSON.stringify(exportData, null, 2));
  console.log('Exported 20 articles to scratch/exported-20-articles.json');
  process.exit(0);
}

exportArticles().catch(console.error);
