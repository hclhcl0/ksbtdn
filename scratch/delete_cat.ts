import { getPayload } from 'payload';
import configPromise from './src/payload.config.ts';

async function run() {
  try {
    const payload = await getPayload({ config: configPromise });
    console.log('Connected to Payload');
    
    // Tìm các category liên quan đến Vấn đề sức khỏe
    const { docs: cats } = await payload.find({
      collection: 'categories',
      where: { slug: { in: ['van-de-suc-khoe', 'a-sung'] } }
    });

    for (const cat of cats) {
      await payload.delete({
        collection: 'categories',
        id: cat.id
      });
      console.log(`Deleted category: ${cat.name} (${cat.id})`);
    }

    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

run();
