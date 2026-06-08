import type { Block } from 'payload';

export const ButtonBlock: Block = {
  slug: 'buttonBlock',
  labels: {
    singular: 'Nút bấm (Call-to-Action)',
    plural: 'Nút bấm (Call-to-Action)',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Nội dung trên nút (Ví dụ: Đăng ký ngay)',
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Đường dẫn (URL)',
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'primary',
      options: [
        { label: 'Chính (Nổi bật - Nền màu)', value: 'primary' },
        { label: 'Phụ (Viền màu - Nền trắng)', value: 'outline' },
      ],
      label: 'Kiểu dáng nút',
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: true,
      label: 'Mở đường dẫn ở Tab mới',
    },
  ],
};
