import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';

async function checkOldDb() {
  process.env.SQLITE_URL = 'file:D:/CDC/webcq/payload-data.db';
  // Also unset DATABASE_URI so it falls back to sqlite
  delete process.env.DATABASE_URI;

  const payload = await getPayload({
    config: configPromise,
  });

  const res = await payload.find({
    collection: 'articles',
    limit: 1,
  });
  console.log(`Articles count: ${res.totalDocs}`);

  const media = await payload.find({
    collection: 'media',
    limit: 1,
  });
  console.log(`Media count: ${media.totalDocs}`);

  process.exit(0);
}

checkOldDb().catch(console.error);
