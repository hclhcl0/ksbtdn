'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

interface AdminUser {
  id: string
  username: string
  fullName: string
  role: string
  department: string
  createdAt?: string
}

const ROLES = [
  { value: 'admin', label: '👑 Quản trị viên' },
  { value: 'editor', label: '✏️ Biên tập viên' },
  { value: 'viewer', label: '👁️ Người xem' },
]

const DEPARTMENTS = [
  'Ban Giám đốc',
  'Phòng Kiểm soát bệnh tật',
  'Phòng Xét nghiệm',
  'Phòng Kiểm dịch y tế',
  'Phòng HIV/AIDS',
  'Phòng Sốt rét - KST - CT',
  'Phòng Tiêm chủng',
  'Phòng Hành chính - Tổng hợp',
  'Phòng Kế toán - Tài chính',
  'Khác',
]

const getRoleInfo = (value: string) => ROLES.find((r) => r.value === value) ?? { value, label: value }

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 6,
  background: 'var(--theme-elevation-100)',
  color: 'var(--theme-text)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
  opacity: 0.85,
}

const spinnerStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  border: '2px solid var(--theme-elevation-150)',
  borderTop: '2px solid var(--theme-text)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
}

const ZaloUsersView: React.FC = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'viewer',
    department: 'Phòng Hành chính - Tổng hợp',
  })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/zalo-admin/users')
      if (!res.ok) throw new Error('Không thể tải danh sách tài khoản')
      const data = await res.json()
      setUsers(data.docs ?? data.data ?? data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchUsers()
  }, [user, fetchUsers])

  if (!user) return null

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/zalo-admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Thêm tài khoản thất bại')
      setShowModal(false)
      setForm({ username: '', password: '', fullName: '', role: 'viewer', department: DEPARTMENTS[7] })
      await fetchUsers()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setSubmitting(false)
    }
  }

  const roleColors: Record<string, string> = {
    admin: '#e53e3e',
    editor: '#3182ce',
    viewer: '#38a169',
  }

  return (
    <div style={{ padding: '32px 24px', color: 'var(--theme-text)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>👤 Quản lý Tài khoản Admin</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.6, fontSize: 14 }}>
            Quản lý tài khoản quản trị hệ thống Zalo OA CDC ({users.length} tài khoản)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'var(--theme-text)',
            color: 'var(--theme-elevation-50)',
            border: 'none',
            borderRadius: 6,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Thêm tài khoản
        </button>
      </div>

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 8, padding: 16, color: '#c53030', marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <div style={spinnerStyle} />
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, opacity: 0.5 }}>
          <div style={{ fontSize: 48 }}>👥</div>
          <p style={{ marginTop: 12 }}>Chưa có tài khoản nào. Thêm tài khoản đầu tiên!</p>
        </div>
      ) : (
        <div style={{
          background: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 2fr 1fr 2fr auto',
            gap: 16,
            padding: '12px 20px',
            background: 'var(--theme-elevation-100)',
            borderBottom: '1px solid var(--theme-elevation-150)',
            fontSize: 12,
            fontWeight: 700,
            opacity: 0.7,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            <span>Username</span>
            <span>Họ và tên</span>
            <span>Vai trò</span>
            <span>Phòng ban</span>
            <span>Ngày tạo</span>
          </div>

          {users.map((u, idx) => {
            const roleInfo = getRoleInfo(u.role)
            const roleColor = roleColors[u.role] ?? '#718096'
            return (
              <div
                key={u.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 2fr 1fr 2fr auto',
                  gap: 16,
                  padding: '14px 20px',
                  borderBottom: idx < users.length - 1 ? '1px solid var(--theme-elevation-100)' : 'none',
                  alignItems: 'center',
                  fontSize: 14,
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>
                  {u.username}
                </span>
                <span>{u.fullName}</span>
                <span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 10,
                    background: roleColor + '20',
                    color: roleColor,
                  }}>
                    {roleInfo.label}
                  </span>
                </span>
                <span style={{ opacity: 0.75, fontSize: 13 }}>{u.department}</span>
                <span style={{ opacity: 0.5, fontSize: 12, whiteSpace: 'nowrap' }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '-'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{
            background: 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: 10,
            padding: '28px 24px',
            width: '100%',
            maxWidth: 520,
            margin: '0 16px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>👤 Thêm tài khoản mới</h2>
            <form onSubmit={handleAdd}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ marginBottom: 4 }}>
                  <label style={labelStyle}>Username *</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                    placeholder="username..."
                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                  />
                </div>
                <div style={{ marginBottom: 4 }}>
                  <label style={labelStyle}>Mật khẩu *</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16, marginTop: 12 }}>
                <label style={labelStyle}>Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Nguyễn Văn A..."
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Vai trò</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    style={inputStyle}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Phòng ban</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    style={inputStyle}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--theme-elevation-150)',
                    color: 'var(--theme-text)',
                    borderRadius: 6,
                    padding: '9px 20px',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'var(--theme-text)',
                    color: 'var(--theme-elevation-50)',
                    border: 'none',
                    borderRadius: 6,
                    padding: '9px 24px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {submitting ? 'Đang tạo...' : '✅ Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ZaloUsersView
