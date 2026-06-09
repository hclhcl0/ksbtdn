'use client';

import React from 'react';
import Script from 'next/script';

interface TikTokVideoSidebarProps {
  /** Video ID lấy từ cache trong Postgres */
  videoId: string;
  /** URL đầy đủ của video VD: https://www.tiktok.com/@handle/video/12345 */
  videoUrl: string;
  /** Mô tả video (tùy chọn) */
  videoDesc?: string;
  /** TikTok handle (không có @) */
  handle: string;
  /** Thời điểm cache cuối */
  cachedAt?: string;
}

export default function TikTokVideoSidebar({
  videoId,
  videoUrl,
  videoDesc,
  handle,
  cachedAt,
}: TikTokVideoSidebarProps) {
  // Dùng key để force re-render widget nếu handle thay đổi
  const embedKey = `tiktok-embed-${handle}`;

  const channelUrl = `https://www.tiktok.com/@${handle}`;
  const formattedDate = cachedAt
    ? new Date(cachedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <div style={{
      background: 'white',
      borderRadius: '14px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    }}>

      {/* ── Header ──────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #010101 0%, #1a0a0a 100%)',
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
        </svg>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.82rem', flex: 1 }}>
          Video mới nhất
        </span>
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fe2c55', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}
        >
          @{handle} ↗
        </a>
      </div>

      {/*
        ── BƯỚC 3: Khung chứa Video TikTok đơn ──────────────
      */}
      <div style={{
        position: 'relative',
        background: '#000',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}>
        {/* Container nội dung TikTok - Không dùng thanh cuộn */}
        <div className="tt-video-inner" style={{ width: '100%', maxWidth: '320px' }}>
          {videoId ? (
            <blockquote
              key={embedKey}
              className="tiktok-embed"
              cite={videoUrl}
              data-video-id={videoId}
              data-embed-type="video"
              style={{ maxWidth: '100%', minWidth: '100%', border: 'none', margin: 0, padding: 0 }}
            >
              <section>
                <a target="_blank" href={videoUrl}>Xem TikTok</a>
              </section>
            </blockquote>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>
              Vui lòng nhập Video ID trong Cấu hình chung.
            </div>
          )}
          <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
        </div>
      </div>

      {/* ── Footer ──────────────────────────────── */}
      <div style={{
        padding: '0.55rem 1rem',
        background: '#fafafa',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        {videoDesc && (
          <p style={{
            fontSize: '0.72rem',
            color: '#6b7280',
            margin: 0,
            flex: 1,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          } as React.CSSProperties}>
            {videoDesc}
          </p>
        )}
        {formattedDate && (
          <span style={{ fontSize: '0.68rem', color: '#9ca3af', flexShrink: 0 }}>
            Cập nhật: {formattedDate}
          </span>
        )}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.72rem', fontWeight: 700,
            color: '#fe2c55', textDecoration: 'none', flexShrink: 0,
          }}
        >
          Xem →
        </a>
      </div>
    </div>
  );
}
