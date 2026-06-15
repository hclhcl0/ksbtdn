'use client'

import React, { useState } from 'react'
import { useAuth } from '@payloadcms/ui'

interface BroadcastForm {
  scope: 'all' | 'staff' | 'citizen'
  messageType: 'text' | 'image' | 'list'
  title: string
  content: string
  url: string
}

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
  color: 'var(--theme-text)',
  opacity: 0.85,
}

const fieldStyle: React.CSSProperties = {
  marginBottom: 20,
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

const ZaloBroadcastView: React.FC = () => {
  const { user } = useAuth()
  const [form, setForm] = useState<BroadcastForm>({
    scope: 'all',
    messageType: 'text',
    title: '',
    content: '',
    url: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!user) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setResult(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content.trim()) {
      setResult({ success: false, message: 'Nội dung tin nhắn không được để trống.' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/zalo-admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Gửi thất bại')
      setResult({ success: true, message: data.message ?? 'Gửi tin nhắn thành công!' })
      setForm((prev) => ({ ...prev, title: '', content: '', url: '' }))
    } catch (err: unknown) {
      setResult({ success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' })
    } finally {
      setLoading(false)
    }
  }

  const scopeOptions = [
    { value: 'all', label: '👥 Tất cả followers' },
    { value: 'staff', label: '🏥 Nhân viên CDC' },
    { value: 'citizen', label: '👤 Người dân' },
  ]

  const typeOptions = [
    { value: 'text', label: '💬 Tin nhắn văn bản' },
    { value: 'image', label: '🖼️ Tin nhắn có ảnh' },
    { value: 'list', label: '📋 Tin nhắn dạng danh sách' },
  ]

  return (
    <div style={{ padding: '32px 24px', color: 'var(--theme-text)', maxWidth: 680 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>📢 Gửi Broadcast Zalo</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.6, fontSize: 14 }}>
          Gửi tin nhắn hàng loạt đến followers của Zalo OA CDC
        </p>
      </div>

      <div style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 10,
        padding: '28px 24px',
      }}>
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Đối tượng gửi</label>
            <select name="scope" value={form.scope} onChange={handleChange} style={inputStyle}>
              {scopeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Loại tin nhắn</label>
            <select name="messageType" value={form.messageType} onChange={handleChange} style={inputStyle}>
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Tiêu đề</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Tiêu đề tin nhắn (tuỳ chọn)"
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Nội dung <span style={{ color: '#e53e3e' }}>*</span></label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Nhập nội dung tin nhắn broadcast..."
              rows={6}
              required
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>URL đính kèm</label>
            <input
              type="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://..."
              style={inputStyle}
            />
          </div>

          {result && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 6,
              marginBottom: 16,
              background: result.success ? '#f0fff4' : '#fff5f5',
              border: `1px solid ${result.success ? '#68d391' : '#fc8181'}`,
              color: result.success ? '#276749' : '#c53030',
              fontSize: 14,
            }}>
              {result.success ? '✅' : '❌'} {result.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'var(--theme-elevation-150)' : 'var(--theme-text)',
              color: 'var(--theme-elevation-50)',
              border: 'none',
              borderRadius: 6,
              padding: '11px 28px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'opacity 0.2s',
            }}
          >
            {loading && <span style={spinnerStyle} />}
            {loading ? 'Đang gửi...' : '🚀 Gửi Broadcast'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ZaloBroadcastView
