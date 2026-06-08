import type { Block } from 'payload';

export const GalleryBlock: Block = {
  slug: 'galleryBlock',
  labels: {
    singular: 'Thư viện ảnh',
    plural: 'Thư viện ảnh',
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Lưới (Grid)', value: 'grid' },
        { label: 'Thanh trượt (Slider / Carousel)', value: 'slider' },
      ],
      label: 'Kiểu hiển thị',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Danh sách hình ảnh',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Chọn ảnh',
          filterOptions: {
            mimeType: { contains: 'image' },
          },
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Chú thích ảnh (không bắt buộc)',
        }
      ],
    },
  ],
};
