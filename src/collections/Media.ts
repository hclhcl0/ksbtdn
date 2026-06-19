import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Tệp phương tiện',
    plural: 'Thư viện phương tiện',
  },
  admin: {
    group: 'Nội dung',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: null,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'application/pdf'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      label: 'Mô tả Alt (SEO/Accessibility)',
      admin: {
        description: 'Nếu bỏ trống, hệ thống sẽ tự động tạo thẻ Alt dựa trên tên bài viết hoặc thông tin mặc định.',
      }
    },
  ],
};
