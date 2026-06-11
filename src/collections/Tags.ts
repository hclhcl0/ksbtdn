import type { CollectionConfig } from 'payload';

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: 'Thẻ / Từ khóa',
    plural: 'Thẻ / Từ khóa',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Nội dung',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Từ khóa',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Đường dẫn tĩnh',
    },
  ],
};
