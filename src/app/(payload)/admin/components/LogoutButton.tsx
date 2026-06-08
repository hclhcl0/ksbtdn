'use client'

import React from 'react'
import { LogOut } from 'lucide-react'

export const LogoutButton = () => {
  return (
    <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--theme-elevation-150)' }}>
      <a 
        href="/admin/logout" 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--theme-error-500)',
          textDecoration: 'none',
          fontWeight: 500,
          padding: '0.5rem',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-error-100)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <LogOut size={18} />
        <span>Đăng xuất</span>
      </a>
    </div>
  )
}
