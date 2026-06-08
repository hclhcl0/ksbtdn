import type { CollectionConfig } from 'payload';
import { lexicalEditor, FixedToolbarFeature, HeadingFeature, AlignFeature, HTMLConverterFeature, BlocksFeature } from '@payloadcms/richtext-lexical';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { PDFBlock } from '../blocks/PDFBlock.ts';
import { GalleryBlock } from '../blocks/GalleryBlock.ts';
import { CalloutBlock } from '../blocks/CalloutBlock.ts';
import { ButtonBlock } from '../blocks/ButtonBlock.ts';
import { RelatedArticlesBlock } from '../blocks/RelatedArticlesBlock.ts';
import { ColumnsBlock } from '../blocks/ColumnsBlock.ts';
import { CardBlock } from '../blocks/CardBlock.ts';

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'status'],
    preview: (doc) => {
      if (doc?.slug) {
        // Sử dụng biến môi trường cho domain thực tế, hoặc mặc định localhost
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000';
        return `${baseUrl}/bai-viet/${doc.slug}?preview=true`;
      }
      return null;
    },
  },
  access: {
    read: ({ req: { user } }) => {
      // Admin/Editor có thể xem tất cả bài (kể cả nháp)
      if (user && (user.role === 'admin' || user.role === 'editor')) {
        return true;
      }
      // Author xem được bài đã public HOẶC bài nháp của chính mình
      if (user && user.role === 'author') {
        return {
          or: [
            { _status: { equals: 'published' } },
            { author: { equals: user.id } },
          ],
        };
      }
      // Public / Guest chỉ xem được bài đã public
      return {
        _status: { equals: 'published' },
      };
    },
    create: ({ req: { user } }) => {
      if (!user) return false;
      return ['admin', 'editor', 'author'].includes(user.role as string);
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin' || user.role === 'editor') return true;
      return { author: { equals: user.id } }; // Author chỉ sửa được bài của mình
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin' || user.role === 'editor') return true;
      return { author: { equals: user.id } };
    },
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [
      ({ req: { user }, data, operation }) => {
        // Tác giả không được quyền tự xuất bản (publish)
        if (user && user.role === 'author') {
          if (data._status === 'published') {
             data._status = 'draft';
          }
        }
        return data;
      }
    ]
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tiêu đề bài viết',
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Ngày đăng (từ NukeViet)',
      admin: {
        position: 'sidebar',
      },
      access: {
        update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Đường dẫn tĩnh (VD: ten-bai-viet)',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      required: true,
      label: 'Chuyên mục',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả ngắn (Trích dẫn)',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh đại diện (Thumbnail)',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Tác giả',
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }) => {
            if (operation === 'create' && req.user && !value) {
              return req.user.id;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4', 'h5', 'h6'] }),
          AlignFeature(),
          HTMLConverterFeature({}),
          BlocksFeature({ blocks: [VideoBlock, PDFBlock, GalleryBlock, CalloutBlock, ButtonBlock, RelatedArticlesBlock, ColumnsBlock] }),
        ]
      }),
      required: true,
      label: 'Nội dung chi tiết',
    },
    {
      name: 'author_name',
      type: 'text',
      label: 'Tên tác giả',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'views',
      type: 'number',
      label: 'Lượt xem',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
      access: {
        update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Từ khóa',
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
