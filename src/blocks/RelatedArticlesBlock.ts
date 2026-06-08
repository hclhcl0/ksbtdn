import type { Block } from 'payload';

export const RelatedArticlesBlock: Block = {
  slug: 'relatedArticlesBlock',
  labels: {
    singular: 'Bài viết liên quan',
    plural: 'Bài viết liên quan',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Bài viết liên quan',
      label: 'Tiêu đề hiển thị (Ví dụ: Xem thêm, Bài viết liên quan)',
    },
    {
      name: 'articles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      required: true,
      minRows: 1,
      maxRows: 5,
      label: 'Chọn các bài viết (Tối đa 5 bài)',
    },
  ],
};
