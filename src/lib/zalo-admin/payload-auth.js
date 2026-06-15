import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';

export async function getZaloSession(request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const headersList = await headers();
    const { user } = await payload.auth({ headers: headersList });
    
    if (user) {
      return { user };
    }
    return null;
  } catch (error) {
    console.error("Payload Auth Error:", error);
    return null;
  }
}
