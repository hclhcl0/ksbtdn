import type { CollectionConfig } from 'payload';

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: {
    singular: 'Video',
    plural: 'Thư viện Video',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'platform', 'channel', 'publishedDate'],
    group: 'Thư viện Video',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tiêu đề video',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          label: 'Nền tảng',
          defaultValue: 'youtube',
          options: [
            { label: '🔴 YouTube', value: 'youtube' },
            { label: '🔵 Facebook', value: 'facebook' },
            { label: '⬛ TikTok', value: 'tiktok' },
          ],
        },
        {
          name: 'channel',
          type: 'relationship',
          relationTo: 'video-channels',
          label: 'Kênh',
          filterOptions: ({ data }: any) => {
            if (!data?.platform) return true;
            return { platform: { equals: data.platform } };
          },
        },
      ],
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      label: 'Link Video',
      admin: {
        description:
          'Dán link đầy đủ của video từ YouTube / Facebook / TikTok vào đây. VD: https://www.youtube.com/watch?v=abc123',
      },
    },
    {
      name: 'embedCode',
      type: 'textarea',
      label: 'Mã nhúng (Embed Code) — dành cho TikTok',
      admin: {
        description:
          'Chỉ cần với video TikTok: Vào TikTok → Chia sẻ → Nhúng → Copy mã và dán vào đây.',
        condition: (data: any) => data?.platform === 'tiktok',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh bìa tùy chỉnh',
      admin: {
        description:
          'Tùy chọn. Nếu để trống: YouTube tự lấy ảnh từ API, Facebook/TikTok sẽ hiển thị biểu tượng nền tảng.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'publishedDate',
          type: 'date',
          label: 'Ngày xuất bản',
          defaultValue: () => new Date().toISOString(),
        },
        {
          name: 'featured',
          type: 'checkbox',
          label: 'Video nổi bật',
          defaultValue: false,
        },
      ],
    },
  ],
};
