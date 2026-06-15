'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'

interface ZaloSettings {
  accessToken: string
  refreshToken: string
  appId: string
  appSecret: string
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
  fontFamily: 'monospace',
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
  marginBottom: 20,
}

const spinnerStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  border: '2px solid var(--theme-elevation-150)',
  borderTop: '2px solid var(--theme-text)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
}

const btnSpinnerStyle: React.CSSProperties = {
  width: 14,
  height: 14,
  border: '2px solid rgba(255,255,255,0.3)',
  borderTop: '2px solid #fff',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  display: 'inline-block',
  marginRight: 6,
  verticalAlign: 'middle',
}

const ZaloSettingsView: React.FC = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<ZaloSettings>({
    accessToken: '',
    refreshToken: '',
    appId: '',
    appSecret: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showSecrets, setShowSecrets] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/zalo-admin/settings')
      if (!res.ok) throw new Error('Không thể tải cài đặt')
      const data = await res.json()
      setSettings({
        accessToken: data.accessToken ?? '',
        refreshToken: data.refreshToken ?? '',
        appId: data.appId ?? '',
        appSecret: data.appSecret ?? '',
      })
    } catch {
      // sử dụng giá trị mặc định
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchSettings()
  }, [user, fetchSettings])

  if (!user) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setSaveResult(null)
    setTestResult(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveResult(null)
    try {
      const res = await fetch('/api/zalo-admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Lưu thất bại')
      setSaveResult({ success: true, message: data.message ?? 'Lưu cài đặt thành công!' })
    } catch (err: unknown) {
      setSaveResult({ success: false, message: err instanceof Error ? err.message : 'Lỗi không xác định' })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/zalo-admin/settings/test-zalo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: settings.accessToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Kết nối thất bại')
      setTestResult({ success: true, message: data.message ?? 'Kết nối Zalo API thành công! ✅' })
    } catch (err: unknown) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : 'Lỗi kết nối' })
    } finally {
      setTesting(false)
    }
  }

  const maskValue = (value: string) =>
    value.length > 8 ? value.slice(0, 4) + '•'.repeat(Math.min(value.length - 8, 24)) + value.slice(-4) : value

  const fields = [
    { key: 'accessToken', label: 'Access Token', placeholder: 'Zalo OA Access Token...', sensitive: true },
    { key: 'refreshToken', label: 'Refresh Token', placeholder: 'Zalo OA Refresh Token...', sensitive: true },
    { key: 'appId', label: 'App ID', placeholder: 'Zalo App ID...', sensitive: false },
    { key: 'appSecret', label: 'App Secret', placeholder: 'Zalo App Secret...', sensitive: true },
  ] as const

  return (
    <div style={{ padding: '32px 24px', color: 'var(--theme-text)', maxWidth: 640 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>⚙️ Cài đặt Zalo API</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.6, fontSize: 14 }}>
          Cấu hình thông tin kết nối Zalo Official Account API
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <div style={spinnerStyle} />
        </div>
      ) : (
        <>
          <div style={{
            background: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 10,
            padding: '28px 24px',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>🔑 Thông tin xác thực</h2>
              <button
                type="button"
                onClick={() => setShowSecrets((s) => !s)}
                style={{
                  background: 'none',
                  border: '1px solid var(--theme-elevation-150)',
                  color: 'var(--theme-text)',
                  borderRadius: 6,
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {showSecrets ? '🙈 Ẩn' : '👁️ Hiện'} secrets
              </button>
            </div>

            <form onSubmit={handleSave}>
              {fields.map(({ key, label, placeholder, sensitive }) => (
                <div key={key} style={fieldStyle}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={sensitive && !showSecrets ? 'password' : 'text'}
                    name={key}
                    value={settings[key]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    style={inputStyle}
                    autoComplete="off"
                  />
                  {sensitive && settings[key] && !showSecrets && (
                    <span style={{ fontSize: 11, opacity: 0.5, marginTop: 3, display: 'block' }}>
                      {maskValue(settings[key])}
                    </span>
                  )}
                </div>
              ))}

              {saveResult && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  marginBottom: 16,
                  background: saveResult.success ? '#f0fff4' : '#fff5f5',
                  border: `1px solid ${saveResult.success ? '#68d391' : '#fc8181'}`,
                  color: saveResult.success ? '#276749' : '#c53030',
                  fontSize: 14,
                }}>
                  {saveResult.success ? '✅' : '❌'} {saveResult.message}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: saving ? 'var(--theme-elevation-150)' : 'var(--theme-text)',
                    color: 'var(--theme-elevation-50)',
                    border: 'none',
                    borderRadius: 6,
                    padding: '11px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving && <span style={btnSpinnerStyle} />}
                  {saving ? 'Đang lưu...' : '💾 Lưu cài đặt'}
                </button>

                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing || !settings.accessToken}
                  style={{
                    background: 'none',
                    border: '1px solid var(--theme-elevation-200)',
                    color: 'var(--theme-text)',
                    borderRadius: 6,
                    padding: '11px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: testing || !settings.accessToken ? 'not-allowed' : 'pointer',
                    opacity: !settings.accessToken ? 0.5 : 1,
                  }}
                >
                  {testing && <span style={{ ...btnSpinnerStyle, borderTopColor: 'var(--theme-text)' }} />}
                  {testing ? 'Đang kiểm tra...' : '🔌 Test kết nối'}
                </button>
              </div>
            </form>
          </div>

          {testResult && (
            <div style={{
              padding: '14px 18px',
              borderRadius: 8,
              background: testResult.success ? '#f0fff4' : '#fff5f5',
              border: `1px solid ${testResult.success ? '#68d391' : '#fc8181'}`,
              color: testResult.success ? '#276749' : '#c53030',
              fontSize: 14,
            }}>
              {testResult.success ? '✅' : '❌'} {testResult.message}
            </div>
          )}

          <div style={{
            marginTop: 16,
            background: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 8,
            padding: '16px 20px',
          }}>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.65, lineHeight: 1.6 }}>
              💡 <strong>Hướng dẫn:</strong> Lấy Access Token và App credentials từ{' '}
              <a
                href="https://developers.zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--theme-text)', opacity: 0.8 }}
              >
                Zalo Developers Portal
              </a>
              . Access Token thường hết hạn sau 90 ngày, cần refresh định kỳ.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default ZaloSettingsView
