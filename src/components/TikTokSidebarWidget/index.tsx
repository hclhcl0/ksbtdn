'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface TikTokSidebarWidgetProps {
  handle: string;          // TikTok username không có @
  channelName?: string;
  channelUrl?: string;
  avatarUrl?: string;
  /** Chiều rộng hiển thị (mặc định 100% container) */
  maxWidth?: number;
}

export default function TikTokSidebarWidget({
  handle,
  channelName,
  channelUrl,
  avatarUrl,
  maxWidth,
}: TikTokSidebarWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Xóa script cũ nếu có
    const old = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (old) old.remove();

    // Inject blockquote TikTok creator embed với width 100%
    containerRef.current.innerHTML = `
      <blockquote
        class="tiktok-embed"
        cite="https://www.tiktok.com/@${handle}"
        data-unique-id="${handle}"
        data-embed-type="creator"
        style="max-width:100%; min-width:auto;"
      >
        <section>
          <a target="_blank" href="https://www.tiktok.com/@${handle}">@${handle}</a>
        </section>
      </blockquote>
    `;

    // Load TikTok embed.js chính thức
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => { script.remove(); };
  }, [handle]);

  const tiktokUrl = channelUrl || `https://www.tiktok.com/@${handle}`;

  return (
    <div style={{
      width: '100%',
      maxWidth: maxWidth ? `${maxWidth}px` : '100%',
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    }}>

      {/* Header nhỏ gọn */}
      <div style={{
        background: 'linear-gradient(135deg, #010101 0%, #1a0a0a 100%)',
        padding: '0.6rem 0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        {/* TikTok icon */}
        <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
        </svg>

        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={channelName || handle}
            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
          />
        )}

        <span style={{
          color: 'white',
          fontWeight: 700,
          fontSize: '0.8rem',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {channelName || `@${handle}`}
        </span>

        <a
          href={tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#fe2c55',
            fontSize: '0.72rem',
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Theo dõi ↗
        </a>
      </div>

      {/*
        ─── PHẦN QUAN TRỌNG ───────────────────────────────────────────
        Kỹ thuật nhúng 9:16:
        1. Outer div: aspect-ratio 9/16 → chiều cao tự tính theo width
        2. position: relative + overflow: hidden → clip nội dung bên trong
        3. Inner div: position absolute, width+height 100%, overflow-y scroll
           nhưng ẩn thanh cuộn hoàn toàn bằng CSS
        4. TikTok embed bên trong tự render với min-height ~600px
           → bị clip bởi outer frame → trông như "cửa sổ điện thoại"
        ───────────────────────────────────────────────────────────────
      */}
      <div style={{
        /* Tỷ lệ 9:16 chuẩn dọc điện thoại */
        aspectRatio: '9/16',
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          /* Cho phép cuộn bên trong nhưng ẩn scrollbar */
          overflowY: 'scroll',
          overflowX: 'hidden',
          /* Ẩn scrollbar: Firefox */
          scrollbarWidth: 'none',
          /* Ẩn scrollbar: IE/Edge */
          msOverflowStyle: 'none',
        } as React.CSSProperties}>
          {/* CSS trick ẩn scrollbar cho webkit (Chrome/Safari) */}
          <style>{`
            .tiktok-sidebar-inner::-webkit-scrollbar { display: none; }
          `}</style>
          <div
            className="tiktok-sidebar-inner"
            ref={containerRef}
            style={{
              width: '100%',
              /* Đảm bảo TikTok embed không bị co lại */
              minHeight: '600px',
            }}
          />
        </div>

        {/* Gradient mờ phía dưới — hiệu ứng fade out đẹp */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />
      </div>

      {/* Footer CTA */}
      <div style={{
        padding: '0.6rem 0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fafafa',
        borderTop: '1px solid #f3f4f6',
      }}>
        <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
          Tự động cập nhật video mới
        </span>
        <a
          href={tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#fe2c55',
            textDecoration: 'none',
          }}
        >
          Xem thêm →
        </a>
      </div>
    </div>
  );
}
