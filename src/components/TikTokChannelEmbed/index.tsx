'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Channel {
  id: string;
  handle: string;
  channelName: string;
  channelUrl?: string;
  avatarUrl?: string;
}

interface TikTokTabsProps {
  channels: Channel[];
}

function TikTokFeed({ handle }: { handle: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Xóa script TikTok cũ
    const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (existingScript) existingScript.remove();

    // Reset blockquote embed
    containerRef.current.innerHTML = `
      <blockquote
        class="tiktok-embed"
        cite="https://www.tiktok.com/@${handle}"
        data-unique-id="${handle}"
        data-embed-type="creator"
        style="max-width:100%; min-width:288px;"
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

  return <div ref={containerRef} style={{ width: '100%' }} />;
}

export default function TikTokTabs({ channels }: TikTokTabsProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = channels[activeIdx];

  if (!active) return null;

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    }}>
      {/* Header — thanh chuyển kênh */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        {/* TikTok logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
          </svg>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>
            TikTok
          </span>
        </div>

        {/* Tab chọn kênh */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {channels.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => setActiveIdx(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: '2px solid',
                borderColor: idx === activeIdx ? '#fe2c55' : 'rgba(255,255,255,0.2)',
                background: idx === activeIdx ? '#fe2c55' : 'rgba(255,255,255,0.07)',
                color: 'white',
                fontWeight: idx === activeIdx ? 700 : 400,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {ch.avatarUrl ? (
                <img src={ch.avatarUrl} alt={ch.channelName}
                  style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
                </svg>
              )}
              {ch.channelName}
            </button>
          ))}
        </div>

        {/* Nút xem trên TikTok */}
        <a
          href={active.channelUrl || `https://www.tiktok.com/@${active.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.9rem',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s',
          }}
        >
          @{active.handle} ↗
        </a>
      </div>

      {/* Vùng hiển thị feed — giới hạn chiều cao, cuộn bên trong */}
      <div style={{
        width: '100%',
        // Giới hạn chiều cao tối đa, bên trong TikTok tự cuộn
        maxHeight: '680px',
        overflow: 'hidden',
        background: '#fafafa',
        position: 'relative',
      }}>
        {/* Gradient fade bottom để trông gọn hơn */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to top, #fafafa, transparent)',
          zIndex: 1,
          pointerEvents: 'none',
        }} />
        <div style={{ padding: '0.75rem', overflow: 'hidden' }}>
          <TikTokFeed key={active.handle} handle={active.handle} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '0.75rem 1.5rem',
        background: '#fafafa',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: '#9ca3af',
      }}>
        <span>Video tự cập nhật khi kênh đăng mới</span>
        <a
          href={active.channelUrl || `https://www.tiktok.com/@${active.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fe2c55', fontWeight: 600, textDecoration: 'none' }}
        >
          Xem tất cả trên TikTok →
        </a>
      </div>
    </div>
  );
}
