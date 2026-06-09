'use client';

import React, { useState } from 'react';

export function YouTubeSyncButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);

  const handleSync = async () => {
    setStatus('loading');
    setResult(null);

    try {
      // Lấy PAYLOAD_SECRET từ cookie Payload (user đã đăng nhập)
      const secret = document.cookie
        .split('; ')
        .find(row => row.startsWith('payload-secret='))
        ?.split('=')[1];

      const response = await fetch('/api/sync-youtube', {
        method: 'POST',
        headers: {
          'authorization': `Bearer YOUR-SUPER-SECRET-KEY`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setResult(data);
      } else {
        setStatus('error');
        setResult(data);
      }
    } catch (err) {
      setStatus('error');
      setResult({ error: String(err) });
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)',
      border: '1px solid #fed7aa',
      borderRadius: '10px',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            {/* YouTube icon */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#FF0000">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
            </svg>
            <strong style={{ color: '#c2410c', fontSize: '0.95rem' }}>Đồng bộ Video YouTube</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e' }}>
            Tự động lấy video mới từ tất cả kênh YouTube (qua RSS Feed). Video đã có sẽ không bị trùng lặp.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={status === 'loading'}
          style={{
            background: status === 'loading' ? '#d1d5db' : '#FF0000',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.6rem 1.25rem',
            fontWeight: '700',
            fontSize: '0.875rem',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
          }}
        >
          {status === 'loading' ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
              Đang đồng bộ...
            </>
          ) : (
            <>
              ↓ Đồng bộ ngay
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          background: status === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${status === 'success' ? '#86efac' : '#fca5a5'}`,
          fontSize: '0.85rem',
        }}>
          {status === 'success' ? (
            <>
              <div style={{ color: '#15803d', fontWeight: '700', marginBottom: '0.4rem' }}>
                ✅ {result.message}
              </div>
              {result.channels && result.channels.map((ch: any, i: number) => (
                <div key={i} style={{ color: '#166534', marginLeft: '1rem' }}>
                  • <strong>{ch.channel}</strong>:{' '}
                  {ch.error
                    ? <span style={{ color: '#dc2626' }}>{ch.error}</span>
                    : <span>Thêm {ch.added} mới, bỏ qua {ch.skipped} trùng (tổng {ch.totalVideos} video)</span>
                  }
                </div>
              ))}
            </>
          ) : (
            <div style={{ color: '#dc2626' }}>
              ❌ Lỗi: {result.error || 'Không xác định'}
            </div>
          )}
        </div>
      )}

      <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: '#b45309' }}>
        💡 Muốn tự động chạy hàng ngày? Hãy yêu cầu kỹ thuật viên cấu hình Cron Job.
      </p>
    </div>
  );
}
