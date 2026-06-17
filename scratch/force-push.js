import { getPayload } from 'payload';
import configPromise from './src/payload.config.ts';

async function forcePush() {
  console.log('Force pushing Payload schema...');
  process.env.PAYLOAD_FORCE_PUSH = 'true';
  const payload = await getPayload({
    config: configPromise,
  });
  console.log('Schema push complete!');
  process.exit(0);
}

forcePush().catch(console.error);
