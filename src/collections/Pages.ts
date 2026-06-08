import type { CollectionConfig } from 'payload';
import { HeroBannerBlock } from '../blocks/HeroBanner.ts';
import { CategoryNewsBlock } from '../blocks/CategoryNews.ts';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tiêu đề trang',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Đường dẫn tĩnh (VD: home)',
      },
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [
        HeroBannerBlock,
        CategoryNewsBlock,
      ],
      label: 'Nội dung trang (Blocks)',
    },
  ],
};
