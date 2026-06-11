import type { Block } from 'payload';

export const CategoryNewsBlock: Block = {
  slug: 'category-news',
  interfaceName: 'CategoryNewsBlock',
  labels: {
    singular: 'Khối chuyên mục tin tức',
    plural: 'Khối chuyên mục tin tức',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tiêu đề khối',
    },
    {
      name: 'categoryInfo',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      required: true,
      label: 'Chuyên mục',
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 4,
      label: 'Số lượng bài viết hiển thị',
    },
  ],
};
