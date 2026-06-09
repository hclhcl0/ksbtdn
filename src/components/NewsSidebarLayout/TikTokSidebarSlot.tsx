'use client';

import dynamic from 'next/dynamic';

const TikTokSidebarWidget = dynamic(
  () => import('@/components/TikTokSidebarWidget'),
  { ssr: false, loading: () => (
    <div style={{
      aspectRatio: '9/16',
      background: '#f3f4f6',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: '0.85rem',
    }}>
      Đang tải TikTok...
    </div>
  )}
);

interface Props {
  handle: string;
  channelName?: string;
  channelUrl?: string;
  avatarUrl?: string;
}

export function TikTokSidebarSlot(props: Props) {
  return <TikTokSidebarWidget {...props} />;
}
