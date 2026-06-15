'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

interface NewsItem {
  id: string
  title: string
  content: string
  category: 'daily' | 'vaccination' | 'alert'
  createdAt?: string
}

const CATEGORIES = [
  { value: 'daily', label: 'Tin vắn dịch bệnh', color: '#3182ce', emoji: '📰' },
  { value: 'vaccination', label: 'Lịch tiêm chủng', color: '#38a169', emoji: '💉' },
  { value: 'alert', label: 'Thông báo khẩn', color: '#e53e3e', emoji: '🚨' },
]

const getCat = (value: string) =>
  CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[0]

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

const ZaloNewsView: React.FC = () => {
  const { user } = useAuth()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', content: '', category: 'daily' as const })

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/zalo-admin/news')
      if (!res.ok) throw new Error('Không thể tải danh sách tin tức')
      const data = await res.json()
      setNews(data.docs ?? data.data ?? data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchNews()
  }, [user, fetchNews])

  if (!user) return null

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/zalo-admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Thêm tin thất bại')
      setShowModal(false)
      setForm({ title: '', content: '', category: 'daily' })
      await fetchNews()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa tin tức này?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/zalo-admin/news/${id}`, { method: 'DELETE' })
      await fetchNews()
    } catch {
      alert('Xóa thất bại')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div style={{ padding: '32px 24px', color: 'var(--theme-text)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>📰 Quản lý Tin tức Zalo OA</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.6, fontSize: 14 }}>Quản lý các tin tức được đăng trên Zalo OA CDC</p>
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
          + Thêm tin mới
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
      ) : news.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, opacity: 0.5 }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <p style={{ marginTop: 12 }}>Chưa có tin tức nào. Thêm tin tức đầu tiên!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {news.map((item) => {
            const cat = getCat(item.category)
            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--theme-elevation-50)',
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: 8,
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: cat.color + '20',
                      color: cat.color,
                      letterSpacing: '0.04em',
                    }}>
                      {cat.emoji} {cat.label}
                    </span>
                    {item.createdAt && (
                      <span style={{ fontSize: 12, opacity: 0.5 }}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.65, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  style={{
                    background: 'none',
                    border: '1px solid #fc8181',
                    color: '#e53e3e',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 13,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {deletingId === item.id ? '...' : '🗑 Xóa'}
                </button>
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
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>📝 Thêm tin tức mới</h2>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Danh mục</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as typeof form.category }))}
                  style={inputStyle}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Tiêu đề *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Tiêu đề tin tức..."
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Nội dung *</label>
                <textarea
                  required
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Nội dung tin tức..."
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                />
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
                  {submitting ? 'Đang lưu...' : '💾 Lưu tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ZaloNewsView
