import type { Block } from 'payload';

export const HeroBannerBlock: Block = {
  slug: 'hero-banner',
  interfaceName: 'HeroBannerBlock',
  labels: {
    singular: 'Banner (Sự kiện nổi bật)',
    plural: 'Banners',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tiêu đề lớn',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn',
    },
    {
      name: 'link',
      type: 'text',
      label: 'Đường dẫn (Link)',
    },
    {
      name: 'tag',
      type: 'text',
      defaultValue: 'Sự kiện nổi bật',
      label: 'Thẻ đánh dấu (Tag)',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Hình nền (Background Image)',
    },
  ],
};
