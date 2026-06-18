import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';

async function updateAdmin() {
  const payload = await getPayload({
    config: configPromise,
  });

  try {
    const res = await payload.update({
      collection: 'users',
      id: 1,
      data: {
        email: 'hclhcl0@gmail.com',
        password: '123456',
        loginAttempts: 0,
        lockUntil: null,
      },
    });
    console.log('Updated user:', res.email);
  } catch (err) {
    console.error('Failed to update:', err.message);
  }

  process.exit(0);
}

updateAdmin().catch(console.error);
