'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

interface KnowledgeItem {
  id: string
  title: string
  category: string
  content: string
  createdAt?: string
}

const KNOWLEDGE_CATEGORIES = [
  { value: 'disease', label: '🦠 Bệnh truyền nhiễm' },
  { value: 'prevention', label: '🛡️ Phòng ngừa' },
  { value: 'vaccination', label: '💉 Tiêm chủng' },
  { value: 'nutrition', label: '🥗 Dinh dưỡng & Sức khỏe' },
  { value: 'emergency', label: '🚑 Cấp cứu & Xử lý' },
  { value: 'other', label: '📁 Khác' },
]

const getCatLabel = (value: string) =>
  KNOWLEDGE_CATEGORIES.find((c) => c.value === value)?.label ?? value

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

const ZaloAiKnowledgeView: React.FC = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', category: 'disease', content: '' })
  const [searchQuery, setSearchQuery] = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/zalo-admin/knowledge')
      if (!res.ok) throw new Error('Không thể tải kho tri thức')
      const data = await res.json()
      setItems(data.docs ?? data.data ?? data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchItems()
  }, [user, fetchItems])

  if (!user) return null

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/zalo-admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Thêm tri thức thất bại')
      setShowModal(false)
      setForm({ title: '', category: 'disease', content: '' })
      await fetchItems()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa entry tri thức này?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/zalo-admin/knowledge/${id}`, { method: 'DELETE' })
      await fetchItems()
    } catch {
      alert('Xóa thất bại')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div style={{ padding: '32px 24px', color: 'var(--theme-text)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>🧠 Kho Tri thức AI</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.6, fontSize: 14 }}>
            Quản lý nguồn dữ liệu huấn luyện cho AI Chatbot Zalo OA ({items.length} entries)
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
          + Thêm tri thức
        </button>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="🔍 Tìm kiếm tri thức..."
        style={{
          width: '100%',
          padding: '10px 14px',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 6,
          background: 'var(--theme-elevation-50)',
          color: 'var(--theme-text)',
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          marginBottom: 20,
        }}
      />

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 8, padding: 16, color: '#c53030', marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <div style={spinnerStyle} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, opacity: 0.5 }}>
          <div style={{ fontSize: 48 }}>🤖</div>
          <p style={{ marginTop: 12 }}>{searchQuery ? 'Không tìm thấy kết quả.' : 'Chưa có tri thức nào. Hãy thêm entry đầu tiên!'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((item) => (
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
                    background: 'var(--theme-elevation-150)',
                    color: 'var(--theme-text)',
                  }}>
                    {getCatLabel(item.category)}
                  </span>
                  {item.createdAt && (
                    <span style={{ fontSize: 12, opacity: 0.5 }}>
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>{item.title}</h3>
                <p style={{
                  margin: 0,
                  fontSize: 13,
                  opacity: 0.65,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.5,
                }}>
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
          ))}
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
            maxWidth: 560,
            margin: '0 16px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>🧠 Thêm tri thức mới</h2>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Danh mục</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  style={inputStyle}
                >
                  {KNOWLEDGE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
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
                  placeholder="Tên chủ đề tri thức..."
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Nội dung tri thức *</label>
                <textarea
                  required
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Nhập nội dung chi tiết, AI sẽ học từ đây để trả lời câu hỏi của người dùng..."
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
                  {submitting ? 'Đang lưu...' : '💾 Lưu tri thức'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ZaloAiKnowledgeView
