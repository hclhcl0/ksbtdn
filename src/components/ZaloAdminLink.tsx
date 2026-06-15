import React from 'react';
import Link from 'next/link';

export const ZaloAdminLink = () => {
  return (
    <div style={{ marginTop: '1rem', padding: '0 1rem' }}>
      <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--theme-elevation-400)', marginBottom: '0.5rem' }}>
        Tích hợp
      </h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li>
          <Link href="/zalo-admin" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0', color: 'var(--theme-elevation-800)', textDecoration: 'none' }}>
            <span style={{ marginRight: '0.5rem' }}>💬</span>
            Zalo Admin
          </Link>
        </li>
      </ul>
    </div>
  );
};
