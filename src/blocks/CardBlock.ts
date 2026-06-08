import type { Block } from 'payload';

export const CardBlock: Block = {
  slug: 'cardBlock',
  labels: {
    singular: 'Thẻ nội dung (Card)',
    plural: 'Thẻ nội dung (Card)',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh minh họa',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn',
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Đường dẫn liên kết (Nếu có)',
    },
    {
      name: 'linkLabel',
      type: 'text',
      label: 'Nhãn nút bấm (Ví dụ: Xem thêm)',
      defaultValue: 'Xem thêm',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.linkUrl),
      }
    }
  ],
};
