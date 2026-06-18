import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';

async function unlock() {
  console.log('Unlocking admin user...');
  const payload = await getPayload({
    config: configPromise,
  });

  try {
    await payload.update({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@ksbt.vnos.org',
        },
      },
      data: {
        loginAttempts: 0,
        lockUntil: null,
      },
    });
    console.log('User unlocked successfully!');
  } catch (e) {
    console.log('Error unlocking user:', e.message);
  }

  process.exit(0);
}

unlock().catch(console.error);
