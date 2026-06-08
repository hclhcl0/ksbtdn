import type { Block } from 'payload';

export const VideoBlock: Block = {
  slug: 'videoBlock',
  labels: {
    singular: 'Video',
    plural: 'Videos',
  },
  fields: [
    {
      name: 'platform',
      type: 'select',
      required: true,
      defaultValue: 'youtube',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Tùy chỉnh (Iframe)', value: 'custom' },
      ],
      label: 'Nền tảng Video',
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Đường dẫn (URL) Video',
      admin: {
        condition: (_, siblingData) => siblingData?.platform !== 'custom',
        description: 'Dán đường dẫn đầy đủ của Video (Ví dụ: https://www.youtube.com/watch?v=...)',
      },
    },
    {
      name: 'embedCode',
      type: 'textarea',
      label: 'Mã nhúng (Iframe/HTML)',
      admin: {
        condition: (_, siblingData) => siblingData?.platform === 'custom',
        description: 'Dán toàn bộ mã nhúng (iframe) do nền tảng cung cấp vào đây',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Chú thích Video (không bắt buộc)',
    }
  ],
};
