import type { CollectionConfig } from 'payload';

export const AiKnowledge: CollectionConfig = {
  slug: 'ai-knowledge',
  labels: {
    singular: 'Tài liệu AI (Knowledge)',
    plural: 'Kho tri thức AI',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
    group: 'AI & Trợ lý ảo',
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Tên tài liệu' },
    { name: 'category', type: 'text', required: true, label: 'Nhãn chuyên môn' },
    { name: 'content', type: 'textarea', required: true, label: 'Nội dung văn bản' },
    { name: 'embedding', type: 'text', label: 'Vector Embedding (JSON)' }, // Store as stringified JSON or text
    { name: 'sourceUrl', type: 'text', label: 'Link gốc (Google Drive...)' },
    { name: 'sourceExt', type: 'text', label: 'Đuôi file gốc' },
    {
      name: 'allowedDepartment',
      type: 'relationship',
      relationTo: 'departments',
      hasMany: true,
      label: 'Phòng ban được phép xem',
      admin: {
        description: 'Để trống = tất cả phòng ban đều có thể xem.',
      },
    },
  ],
};
