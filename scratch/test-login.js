import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';

async function testUser() {
  const payload = await getPayload({
    config: configPromise,
  });

  console.log('Fetching users...');
  const users = await payload.find({
    collection: 'users',
    limit: 10,
  });
  console.log(users.docs.map(u => ({ email: u.email, id: u.id, lockUntil: u.lockUntil, loginAttempts: u.loginAttempts })));

  try {
    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: 'hclhcl0@gmail.com',
        password: '123456',
      },
    });
    console.log('Login successful for hclhcl0@gmail.com', loginResult.token ? 'Has token' : 'No token');
  } catch (err) {
    console.error('Login failed:', err.message);
  }

  process.exit(0);
}

testUser().catch(console.error);
