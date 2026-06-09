'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { PlayCircle, X, Globe } from 'lucide-react';
import dynamic from 'next/dynamic';
import styles from './Video.module.css';

const TikTokChannelEmbed = dynamic(
  () => import('@/components/TikTokChannelEmbed'),
  { ssr: false, loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Đang tải TikTok feed...</div> }
);

// Platform config
const PLATFORMS = [
  { value: 'all', label: 'Tất cả', color: '#6b7280' },
  { value: 'youtube', label: 'YouTube', color: '#FF0000' },
  { value: 'facebook', label: 'Facebook', color: '#1877F2' },
  { value: 'tiktok', label: 'TikTok', color: '#010101' },
];

function extractYoutubeId(url: string) {
  if (!url) return null;
  if (url.length === 11 && !url.includes('/') && !url.includes('http')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^#&?]{11})/);
  return match ? match[1] : null;
}

function extractFacebookEmbedUrl(url: string) {
  if (!url) return null;
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&width=800&show_text=false&mute=0`;
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
      </svg>
    );
  }
  if (platform === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  if (platform === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
      </svg>
    );
  }
  return <Globe size={14} />;
}

function getPlatformColor(platform: string) {
  const p = PLATFORMS.find(p => p.value === platform);
  return p ? p.color : '#6b7280';
}

export default function VideoLibraryClient({ videos, channels }: { videos: any[]; channels: any[] }) {
  const [activePlatform, setActivePlatform] = useState('all');
  const [activeChannel, setActiveChannel] = useState('all');
  const [modalVideo, setModalVideo] = useState<any | null>(null);

  // Filter channels by active platform
  const filteredChannels = useMemo(() => {
    if (activePlatform === 'all') return channels;
    return channels.filter(c => c.platform === activePlatform);
  }, [channels, activePlatform]);

  // Filter videos
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchPlatform = activePlatform === 'all' || v.platform === activePlatform;
      const matchChannel = activeChannel === 'all' || (v.channel && (v.channel.id === activeChannel || v.channel === activeChannel));
      return matchPlatform && matchChannel;
    });
  }, [videos, activePlatform, activeChannel]);

  const handlePlatformChange = useCallback((platform: string) => {
    setActivePlatform(platform);
    setActiveChannel('all');
  }, []);

  const openModal = useCallback((video: any) => {
    // TikTok: open in new tab instead of modal
    if (video.platform === 'tiktok') {
      window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setModalVideo(video);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setModalVideo(null);
    document.body.style.overflow = '';
  }, []);

  // Build embed URL
  function buildEmbedUrl(video: any) {
    if (video.platform === 'youtube') {
      const ytId = extractYoutubeId(video.videoUrl);
      return ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0` : null;
    }
    if (video.platform === 'facebook') {
      return extractFacebookEmbedUrl(video.videoUrl);
    }
    return null;
  }

  // Build thumbnail
  function buildThumbnail(video: any) {
    if (video.thumbnail?.url) return video.thumbnail.url;
    if (video.platform === 'youtube') {
      const ytId = extractYoutubeId(video.videoUrl);
      return ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null;
    }
    return null;
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={styles.pageTitle}>THƯ VIỆN VIDEO</h1>
        <p className={styles.subtitle}>Video truyền thông, giáo dục sức khỏe của CDC Đà Nẵng.</p>
      </div>

      {/* Platform filter tabs */}
      <div className={styles.platformTabs}>
        {PLATFORMS.map(p => (
          <button
            key={p.value}
            onClick={() => handlePlatformChange(p.value)}
            className={`${styles.platformTab} ${activePlatform === p.value ? styles.platformTabActive : ''}`}
            style={activePlatform === p.value ? { borderColor: p.color, color: p.color } : {}}
          >
            {p.label}
            <span className={styles.platformCount}>
              {p.value === 'all' ? videos.length : videos.filter(v => v.platform === p.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Channel filter */}
      {filteredChannels.length > 0 && (
        <div className={styles.channelFilter}>
          <span className={styles.channelLabel}>Kênh:</span>
          <div className={styles.channelList}>
            <button
              onClick={() => setActiveChannel('all')}
              className={`${styles.channelBtn} ${activeChannel === 'all' ? styles.channelBtnActive : ''}`}
            >
              Tất cả kênh
            </button>
            {filteredChannels.map((ch: any) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`${styles.channelBtn} ${activeChannel === ch.id ? styles.channelBtnActive : ''}`}
              >
                {ch.avatar?.url && (
                  <img src={ch.avatar.url} alt={ch.name} className={styles.channelAvatar} />
                )}
                {ch.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TikTok: Hiển thị dạng Tab chuyển kênh */}
      {activePlatform === 'tiktok' ? (
        <div>
          {filteredChannels.filter((ch: any) => ch.tiktokHandle).length === 0 ? (
            <div className={styles.emptyState}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="#d1d5db" style={{ margin: '0 auto 1rem', display: 'block' }}>
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
              </svg>
              <p>Chưa có kênh TikTok nào. Hãy thêm kênh TikTok vào CMS và điền TikTok Username.</p>
            </div>
          ) : (
            <TikTokChannelEmbed
              channels={filteredChannels
                .filter((ch: any) => ch.tiktokHandle)
                .map((ch: any) => ({
                  id: ch.id,
                  handle: ch.tiktokHandle,
                  channelName: ch.name,
                  channelUrl: ch.channelUrl,
                  avatarUrl: ch.avatar?.url,
                }))
              }
            />
          )}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className={styles.emptyState}>
          <PlayCircle size={52} className={styles.emptyIcon} />
          <p>Chưa có video nào trong mục này.</p>
        </div>
      ) : (
        <div className={styles.videoGrid}>
          {filteredVideos.map((video: any) => {
            const thumb = buildThumbnail(video);
            const color = getPlatformColor(video.platform);
            const isTikTok = video.platform === 'tiktok';
            const date = video.publishedDate
              ? new Date(video.publishedDate).toLocaleDateString('vi-VN')
              : '';

            return (
              <div key={video.id} className={styles.videoCard} onClick={() => openModal(video)}>
                {/* Thumbnail */}
                <div className={styles.thumbWrapper}>
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={video.title}
                      className={styles.thumb}
                      onError={(e) => {
                        const ytId = extractYoutubeId(video.videoUrl);
                        if (ytId && (e.target as HTMLImageElement).src.includes('maxresdefault')) {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                        }
                      }}
                    />
                  ) : (
                    <div className={styles.thumbPlaceholder} style={{ backgroundColor: color + '18' }}>
                      <PlatformIcon platform={video.platform} />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className={styles.thumbOverlay}>
                    <div className={styles.playBtn} style={{ backgroundColor: color }}>
                      {isTikTok ? (
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
                        </svg>
                      ) : (
                        <PlayCircle size={28} fill="white" stroke="none" />
                      )}
                    </div>
                    {isTikTok && (
                      <span className={styles.externalLabel}>Xem trên TikTok ↗</span>
                    )}
                  </div>

                  {/* Platform badge */}
                  <div className={styles.platformBadge} style={{ backgroundColor: color }}>
                    <PlatformIcon platform={video.platform} />
                    <span>{PLATFORMS.find(p => p.value === video.platform)?.label}</span>
                  </div>

                  {video.featured && (
                    <div className={styles.featuredBadge}>⭐ Nổi bật</div>
                  )}
                </div>

                {/* Info */}
                <div className={styles.cardInfo}>
                  {date && <div className={styles.cardDate}>{date}</div>}
                  <h3 className={styles.cardTitle}>{video.title}</h3>
                  {video.description && (
                    <p className={styles.cardDesc}>{video.description}</p>
                  )}
                  {video.channel && typeof video.channel === 'object' && (
                    <div className={styles.cardChannel}>
                      {video.channel.avatar?.url && (
                        <img src={video.channel.avatar.url} alt={video.channel.name} className={styles.channelAvatarSm} />
                      )}
                      <span>{video.channel.name}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Modal */}
      {modalVideo && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal} aria-label="Đóng">
              <X size={22} />
            </button>
            <div className={styles.modalTitle}>
              <div className={styles.platformBadgeInline} style={{ backgroundColor: getPlatformColor(modalVideo.platform) }}>
                <PlatformIcon platform={modalVideo.platform} />
                <span>{PLATFORMS.find(p => p.value === modalVideo.platform)?.label}</span>
              </div>
              <h2>{modalVideo.title}</h2>
            </div>
            <div className={styles.iframeWrapper}>
              {buildEmbedUrl(modalVideo) ? (
                <iframe
                  src={buildEmbedUrl(modalVideo)!}
                  title={modalVideo.title}
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  className={styles.iframe}
                />
              ) : (
                <div className={styles.noEmbed}>
                  <p>Không thể nhúng video này.</p>
                  <a href={modalVideo.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    Xem trực tiếp ↗
                  </a>
                </div>
              )}
            </div>
            {modalVideo.description && (
              <p className={styles.modalDesc}>{modalVideo.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
