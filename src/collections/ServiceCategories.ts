import type { CollectionConfig } from 'payload';

export const ServiceCategories: CollectionConfig = {
  slug: 'serviceCategories',
  labels: {
    singular: 'Nhóm Dịch vụ',
    plural: 'Nhóm Dịch vụ',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    group: 'Dịch vụ sản phẩm',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên nhóm',
      admin: {
        placeholder: 'VD: Khám bệnh, Xét nghiệm, Tiêm chủng...',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (URL)',
      admin: {
        description: 'Viết thường, không dấu, dùng gạch ngang (VD: xet-nghiem)',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự hiển thị',
      defaultValue: 0,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Biểu tượng (emoji hoặc class)',
    },
  ],
};
