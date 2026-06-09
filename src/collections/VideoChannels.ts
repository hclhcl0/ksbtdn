import type { CollectionConfig } from 'payload';

export const VideoChannels: CollectionConfig = {
  slug: 'video-channels',
  labels: {
    singular: 'Kênh Video',
    plural: 'Quản lý Kênh Video',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'platform', 'channelUrl'],
    group: 'Thư viện Video',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên kênh',
      admin: {
        description: 'VD: Kênh CDC Đà Nẵng chính thức, Fanpage CDC Đà Nẵng...',
      },
    },
    {
      name: 'platform',
      type: 'select',
      required: true,
      label: 'Nền tảng',
      options: [
        { label: '🔴 YouTube', value: 'youtube' },
        { label: '🔵 Facebook', value: 'facebook' },
        { label: '⬛ TikTok', value: 'tiktok' },
      ],
    },
    {
      name: 'channelUrl',
      type: 'text',
      label: 'Đường dẫn kênh',
      admin: {
        description: 'Link tới trang kênh/fanpage (VD: https://youtube.com/@cdcdanang)',
      },
    },
    {
      name: 'channelId',
      type: 'text',
      label: 'Channel ID / Page ID',
      admin: {
        description: 'YouTube: Dán Channel ID vào đây để bật tính năng đồng bộ RSS tự động. Lấy tại: commentpicker.com/youtube-channel-id.php',
        condition: (data: any) => data?.platform === 'youtube',
      },
    },
    {
      name: 'tiktokHandle',
      type: 'text',
      label: 'TikTok Username (không có @)',
      admin: {
        description: 'VD: kênh @cdcdanang_anlanhsongkhoe thì nhập: cdcdanang_anlanhsongkhoe — Hệ thống sẽ tự nhúng toàn bộ feed kênh TikTok này lên trang web.',
        condition: (data: any) => data?.platform === 'tiktok',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh đại diện kênh',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Giới thiệu ngắn về kênh',
    },
  ],
};
