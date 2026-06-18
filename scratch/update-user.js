import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';

async function updateUser() {
  console.log('Updating admin user...');
  const payload = await getPayload({
    config: configPromise,
  });

  try {
    const res = await payload.update({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@ksbt.vnos.org',
        },
      },
      data: {
        email: 'hclhcl0@gmail.com',
        password: '123456',
        loginAttempts: 0,
        lockUntil: null,
      },
    });
    console.log('User updated successfully:', res.docs[0]?.email);
  } catch (e) {
    console.log('Error updating user:', e.message);
  }

  process.exit(0);
}

updateUser().catch(console.error);
