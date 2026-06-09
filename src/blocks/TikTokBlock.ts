import type { Block } from 'payload';

export const TikTokBlock: Block = {
  slug: 'tiktokBlock',
  labels: {
    singular: 'Video TikTok',
    plural: 'Videos TikTok',
  },
  fields: [
    {
      name: 'videoId',
      type: 'text',
      label: 'Video ID (Chuỗi số)',
      required: true,
      admin: {
        description: 'Nhập ID của video TikTok (Ví dụ: 7375253819864222994)',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Đường dẫn (URL) Video',
      required: true,
      admin: {
        description: 'Dán đường dẫn đầy đủ của Video (Ví dụ: https://www.tiktok.com/@cdcdanang_anlanhsongkhoe/video/...)',
      },
    },
    {
      name: 'maxWidth',
      type: 'number',
      label: 'Độ rộng tối đa (px)',
      defaultValue: 320,
      admin: {
        description: 'Tùy chỉnh kích thước hiển thị của khung video. Mặc định là 320px (vừa chuẩn điện thoại).',
      },
    },
    {
      name: 'alignment',
      type: 'select',
      label: 'Căn chỉnh vị trí',
      defaultValue: 'center',
      options: [
        { label: 'Căn trái', value: 'left' },
        { label: 'Căn giữa', value: 'center' },
        { label: 'Căn phải', value: 'right' },
      ],
      admin: {
        description: 'Vị trí hiển thị của video trên trang',
      },
    },
  ],
};
