import type { CollectionConfig } from 'payload';

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Chuyên mục',
    plural: 'Chuyên mục bài viết',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Nội dung',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên chuyên mục',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        components: {
          Field: '@/components/SlugField.tsx#SlugField',
        },
        description: 'Đường dẫn tĩnh (VD: tin-tuc-su-kien)',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Chuyên mục cha',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả',
    },
  ],
};
