import type { GlobalConfig } from 'payload';

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer (Chân trang & Giới thiệu)',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'aboutText',
      type: 'textarea',
      label: 'Đoạn giới thiệu ngắn (Hiển thị ở Footer)',
      defaultValue: '',
    },
    {
      name: 'addressMain',
      type: 'text',
      label: 'Trụ sở chính',
      defaultValue: '',
    },
    {
      name: 'addressSub',
      type: 'text',
      label: 'Cơ sở 2',
      defaultValue: '',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Số điện thoại',
      defaultValue: '',
    },
    {
      name: 'email',
      type: 'text',
      label: 'Email',
      defaultValue: '',
    },
    {
      name: 'quickLinks',
      type: 'array',
      label: 'Liên kết nhanh',
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Tên' },
        { name: 'url', type: 'text', required: true, label: 'URL' },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Mạng xã hội (Các kênh truyền thông)',
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: 'Nền tảng',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Zalo', value: 'zalo' },
            { label: 'Website khác', value: 'website' },
          ],
        },
        {
          name: 'label',
          type: 'text',
          label: 'Tên kênh (Ví dụ: Fanpage chính thức, Kênh Đào tạo...)',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: 'Đường dẫn (URL)',
          required: true,
        },
      ]
    },
    {
      name: 'copyrightText',
      type: 'text',
      label: 'Dòng bản quyền (Copyright)',
      defaultValue: '© Bản quyền thuộc về TRUNG TÂM KIỂM SOÁT BỆNH TẬT THÀNH PHỐ ĐÀ NẴNG',
      admin: {
        description: 'Sử dụng {year} để tự động hiển thị năm hiện tại.',
      }
    },
    {
      name: 'designerCredit',
      type: 'text',
      label: 'Thông tin thiết kế',
      defaultValue: 'thiết kế bởi CNTT CDC Đà Nẵng',
    }
  ],
};
