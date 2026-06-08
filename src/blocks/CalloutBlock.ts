import type { Block } from 'payload';

export const CalloutBlock: Block = {
  slug: 'calloutBlock',
  labels: {
    singular: 'Hộp Lưu ý / Cảnh báo',
    plural: 'Hộp Lưu ý / Cảnh báo',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Thông tin (Xanh dương - 💡)', value: 'info' },
        { label: 'Cảnh báo (Vàng - ⚠️)', value: 'warning' },
        { label: 'Quan trọng / Nguy hiểm (Đỏ - ⛔)', value: 'danger' },
        { label: 'Thành công (Xanh lá - ✅)', value: 'success' },
      ],
      label: 'Loại thông báo',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề hộp thoại (không bắt buộc)',
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Nội dung thông báo',
    },
  ],
};
