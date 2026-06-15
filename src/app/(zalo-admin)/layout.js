import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { PayloadAuthProvider } from '@/components/zalo-admin/PayloadAuthProvider';
import DashboardShell from '@/components/zalo-admin/DashboardShell';
import './zalo-admin-globals.css';

export const metadata = {
  title: 'Zalo Admin Dashboard',
  description: 'Zalo OA Management Dashboard',
};

export default async function ZaloAdminLayout({ children }) {
  // Check if user is authenticated via Payload
  const payload = await getPayload({ config: configPromise });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });

  if (!user) {
    // If not authenticated, redirect to Payload's native login
    redirect('/admin/login?redirect=/zalo-admin');
  }

  return (
    <html lang="vi">
      <body>
        <PayloadAuthProvider user={user}>
          <DashboardShell>
            {children}
          </DashboardShell>
        </PayloadAuthProvider>
      </body>
    </html>
  );
}
