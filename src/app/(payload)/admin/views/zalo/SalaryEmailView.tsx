'use client'

import React, { useRef, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

type TabType = 'salary' | 'zalo'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 6,
  background: 'var(--theme-elevation-50)',
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
  color: 'var(--theme-text)',
}

const fieldStyle: React.CSSProperties = {
  marginBottom: 18,
}

const spinnerStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  border: '2px solid rgba(255,255,255,0.3)',
  borderTop: '2px solid #fff',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  display: 'inline-block',
  marginRight: 8,
  verticalAlign: 'middle',
}

const ZaloSalaryEmailView: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('salary')
  const [salaryFile, setSalaryFile] = useState<File | null>(null)
  const [salaryLoading, setSalaryLoading] = useState(false)
  const [salaryResult, setSalaryResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [zaloForm, setZaloForm] = useState({ zaloUserId: '', content: '' })
  const [zaloLoading, setZaloLoading] = useState(false)
  const [zaloResult, setZaloResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!user) return null

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salaryFile) {
      setSalaryResult({ success: false, message: 'Vui lòng chọn file Excel phiếu lương.' })
      return
    }
    setSalaryLoading(true)
    setSalaryResult(null)
    try {
      const formData = new FormData()
      formData.append('file', salaryFile)
      const res = await fetch('/api/zalo-admin/salary-email/send', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Gửi phiếu lương thất bại')
      setSalaryResult({ success: true, message: data.message ?? 'Gửi phiếu lương thành công!' })
      setSalaryFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: unknown) {
      setSalaryResult({ success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' })
    } finally {
      setSalaryLoading(false)
    }
  }

  const handleZaloSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!zaloForm.zaloUserId.trim() || !zaloForm.content.trim()) {
      setZaloResult({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' })
      return
    }
    setZaloLoading(true)
    setZaloResult(null)
    try {
      const res = await fetch('/api/zalo-admin/salary-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'zalo_internal', ...zaloForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Gửi tin Zalo thất bại')
      setZaloResult({ success: true, message: data.message ?? 'Gửi tin Zalo nội bộ thành công!' })
      setZaloForm({ zaloUserId: '', content: '' })
    } catch (err: unknown) {
      setZaloResult({ success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' })
    } finally {
      setZaloLoading(false)
    }
  }

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'salary', label: 'Gửi phiếu lương', icon: '💰' },
    { key: 'zalo', label: 'Gửi tin Zalo nội bộ', icon: '💬' },
  ]

  return (
    <div style={{ padding: '32px 24px', color: 'var(--theme-text)', maxWidth: 680 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>📤 Gửi tin nội bộ</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.6, fontSize: 14 }}>
          Gửi phiếu lương và tin nhắn Zalo nội bộ cho nhân viên CDC
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 24,
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
        padding: 4,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 700 : 400,
              background: activeTab === tab.key ? 'var(--theme-text)' : 'transparent',
              color: activeTab === tab.key ? 'var(--theme-elevation-50)' : 'var(--theme-text)',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 10,
        padding: '28px 24px',
      }}>
        {/* Salary Tab */}
        {activeTab === 'salary' && (
          <form onSubmit={handleSalarySubmit}>
            <div style={{ marginBottom: 24, padding: '16px', background: 'var(--theme-elevation-100)', borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.7, lineHeight: 1.6 }}>
                📋 <strong>Hướng dẫn:</strong> Upload file Excel (.xlsx) chứa danh sách phiếu lương nhân viên.
                File cần có các cột: <code>email</code>, <code>hoTen</code>, <code>luongCoBan</code>, <code>phucap</code>, <code>khanTru</code>, <code>thucLinh</code>.
              </p>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>File Excel phiếu lương *</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--theme-elevation-200)',
                  borderRadius: 8,
                  padding: '32px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>
                  {salaryFile ? (
                    <span style={{ color: '#38a169', fontWeight: 600 }}>✅ {salaryFile.name}</span>
                  ) : (
                    'Kéo thả hoặc click để chọn file .xlsx'
                  )}
                </div>
                <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>Chỉ chấp nhận file .xlsx, .xls</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={(e) => {
                  setSalaryFile(e.target.files?.[0] ?? null)
                  setSalaryResult(null)
                }}
              />
            </div>

            {salaryResult && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 6,
                marginBottom: 16,
                background: salaryResult.success ? '#f0fff4' : '#fff5f5',
                border: `1px solid ${salaryResult.success ? '#68d391' : '#fc8181'}`,
                color: salaryResult.success ? '#276749' : '#c53030',
                fontSize: 14,
              }}>
                {salaryResult.success ? '✅' : '❌'} {salaryResult.message}
              </div>
            )}

            <button
              type="submit"
              disabled={salaryLoading || !salaryFile}
              style={{
                background: salaryLoading || !salaryFile ? 'var(--theme-elevation-150)' : 'var(--theme-text)',
                color: 'var(--theme-elevation-50)',
                border: 'none',
                borderRadius: 6,
                padding: '11px 28px',
                fontSize: 14,
                fontWeight: 600,
                cursor: salaryLoading || !salaryFile ? 'not-allowed' : 'pointer',
              }}
            >
              {salaryLoading && <span style={spinnerStyle} />}
              {salaryLoading ? 'Đang gửi...' : '📧 Gửi phiếu lương'}
            </button>
          </form>
        )}

        {/* Zalo Internal Tab */}
        {activeTab === 'zalo' && (
          <form onSubmit={handleZaloSubmit}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Zalo User ID người nhận *</label>
              <input
                type="text"
                required
                value={zaloForm.zaloUserId}
                onChange={(e) => setZaloForm((p) => ({ ...p, zaloUserId: e.target.value }))}
                placeholder="Nhập Zalo User ID..."
                style={inputStyle}
              />
              <span style={{ fontSize: 12, opacity: 0.55, marginTop: 4, display: 'block' }}>
                Zalo User ID của nhân viên cần gửi tin nhắn nội bộ
              </span>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Nội dung tin nhắn *</label>
              <textarea
                required
                rows={6}
                value={zaloForm.content}
                onChange={(e) => setZaloForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Nhập nội dung tin nhắn nội bộ..."
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              />
            </div>

            {zaloResult && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 6,
                marginBottom: 16,
                background: zaloResult.success ? '#f0fff4' : '#fff5f5',
                border: `1px solid ${zaloResult.success ? '#68d391' : '#fc8181'}`,
                color: zaloResult.success ? '#276749' : '#c53030',
                fontSize: 14,
              }}>
                {zaloResult.success ? '✅' : '❌'} {zaloResult.message}
              </div>
            )}

            <button
              type="submit"
              disabled={zaloLoading}
              style={{
                background: zaloLoading ? 'var(--theme-elevation-150)' : 'var(--theme-text)',
                color: 'var(--theme-elevation-50)',
                border: 'none',
                borderRadius: 6,
                padding: '11px 28px',
                fontSize: 14,
                fontWeight: 600,
                cursor: zaloLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {zaloLoading && <span style={spinnerStyle} />}
              {zaloLoading ? 'Đang gửi...' : '💬 Gửi tin Zalo'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ZaloSalaryEmailView
