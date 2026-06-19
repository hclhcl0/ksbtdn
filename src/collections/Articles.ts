import type { CollectionConfig } from 'payload';
import { lexicalEditor, FixedToolbarFeature, HeadingFeature, AlignFeature, HTMLConverterFeature, BlocksFeature } from '@payloadcms/richtext-lexical';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { TikTokBlock } from '../blocks/TikTokBlock.ts';
import { PDFBlock } from '../blocks/PDFBlock.ts';
import { GalleryBlock } from '../blocks/GalleryBlock.ts';
import { CalloutBlock } from '../blocks/CalloutBlock.ts';
import { ButtonBlock } from '../blocks/ButtonBlock.ts';
import { RelatedArticlesBlock } from '../blocks/RelatedArticlesBlock.ts';
import { ColumnsBlock } from '../blocks/ColumnsBlock.ts';
import { CardBlock } from '../blocks/CardBlock.ts';

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Bài viết',
    plural: 'Danh sách bài viết',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'reviewStatus', 'status'],
    group: 'Nội dung',
    preview: (doc) => {
      if (doc?.slug) {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000';
        return `${baseUrl}/bai-viet/${doc.slug}?preview=true`;
      }
      return null;
    },
  },
  access: {
    read: ({ req: { user } }) => {
      // Admin, Editor, Moderator xem tất cả bài (kể cả nháp)
      if (user && ['admin', 'editor', 'moderator'].includes(user.role as string)) {
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
      return ['admin', 'editor', 'moderator', 'author'].includes(user.role as string);
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      // Admin, Editor, Moderator sửa được tất cả
      if (['admin', 'editor', 'moderator'].includes(user.role as string)) return true;
      // Author chỉ sửa bài của mình
      return { author: { equals: user.id } };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      // Moderator KHÔNG được xóa bài
      if (['admin', 'editor'].includes(user.role as string)) return true;
      // Author chỉ được xóa bài nháp của mình
      return { author: { equals: user.id } };
    },
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [
      ({ req: { user }, data }) => {
        // Author không được tự xuất bản (publish)
        if (user && user.role === 'author') {
          if (data._status === 'published') {
            data._status = 'draft';
          }
          // Author chỉ được đặt reviewStatus là draft hoặc pending_review
          if (data.reviewStatus && !['draft', 'pending_review'].includes(data.reviewStatus)) {
            data.reviewStatus = 'draft';
          }
        }
        return data;
      },
      // Validate chuyên mục được phép cho Author
      async ({ req, data, operation }) => {
        if (req.user?.role === 'author') {
          const allowedCategories = (req.user as any)?.allowedCategories;
          if (allowedCategories && allowedCategories.length > 0 && data.category) {
            const categoryId = typeof data.category === 'string' ? data.category : (data.category as any)?.id;
            const allowedIds = allowedCategories.map((c: any) =>
              typeof c === 'string' ? c : c?.id
            );
            if (categoryId && !allowedIds.includes(categoryId)) {
              throw new Error('Bạn chỉ được phép viết bài trong các chuyên mục đã được phân công. Vui lòng chọn đúng chuyên mục.');
            }
          }
        }
        return data;
      },
      // Extract first image from content if no image is provided
      async ({ data }) => {
        if (!data.image && data.content && data.content.root) {
          // Recursive function to find first upload block
          const findFirstImage = (nodes: any[]): any => {
            for (const node of nodes) {
              if (node.type === 'upload' && node.relationTo === 'media') {
                return node.value?.id || node.value;
              }
              if (node.children) {
                const found = findFirstImage(node.children);
                if (found) return found;
              }
            }
            return null;
          };
          
          const firstImageId = findFirstImage(data.content.root.children || []);
          if (firstImageId) {
            data.image = firstImageId;
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // Trigger broadcast only on state change to published
        if (
          doc._status === 'published' &&
          previousDoc?._status !== 'published' &&
          doc.autoZaloBroadcast
        ) {
          try {
            const { sendPromotionMessage } = await import('../lib/zalo-admin/zalo');
            // Find all followers
            const followersRes = await req.payload.find({
              collection: 'zalo-followers',
              limit: 5000,
            });
            const userIds = followersRes.docs.map(f => f.zaloUserId);
            
            if (userIds.length > 0) {
              const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000';
              const fullUrl = `${baseUrl}/bai-viet/${doc.slug}`;
              const coverUrl = doc.image && typeof doc.image === 'object' ? doc.image.url : '';

              // Build payload for list message with 1 item
              const broadcastData = {
                scope: "all",
                messageType: "list",
                elements: [{
                  title: doc.title.substring(0, 120),
                  subtitle: doc.description ? doc.description.substring(0, 120) : doc.title.substring(0, 120),
                  imageUrl: coverUrl,
                  actionType: "oa.open.url",
                  actionValue: fullUrl
                }]
              };
              
              const payloadStr = JSON.stringify(broadcastData);

              // Create log entry
              const broadcastLog = await req.payload.create({
                collection: 'zalo-broadcasts',
                data: {
                  scope: "all",
                  content: doc.title,
                  rawPayload: payloadStr,
                  total: userIds.length,
                  sentCount: 0,
                  successCount: 0,
                  failCount: 0,
                  status: "sending",
                  createdBy: req.user?.name || "Hệ thống Tự động",
                },
              });

              // Send in background without blocking the request
              setTimeout(async () => {
                let success = 0;
                let fail = 0;

                for (const uid of userIds) {
                  try {
                    const result = await sendPromotionMessage(uid, broadcastData);
                    if (result && result.error === 0) {
                      success++;
                    } else {
                      fail++;
                    }
                  } catch (err) {
                    fail++;
                  }
                  // Small delay to respect rate limits
                  await new Promise(res => setTimeout(res, 100));
                }

                await req.payload.update({
                  collection: 'zalo-broadcasts',
                  id: broadcastLog.id,
                  data: {
                    status: "completed",
                    sentCount: success + fail,
                    successCount: success,
                    failCount: fail,
                    completedAt: new Date().toISOString(),
                  },
                });
              }, 100);
            }
          } catch (e) {
            console.error("Auto Zalo Broadcast Error:", e);
          }
        }
        return doc;
      }
    ],
  },
  fields: [
    {
      name: 'autoZaloBroadcast',
      type: 'checkbox',
      label: 'Tự động gửi lên Zalo OA ngay khi xuất bản',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Chỉ có tác dụng khi trạng thái bài viết chuyển sang Đã xuất bản.',
      },
    },
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
      label: 'Đường dẫn tĩnh (Slug)',
      required: true,
      unique: true,
      admin: {
        components: {
          Field: '@/components/SlugField.tsx#SlugField',
        },
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
      name: 'reviewStatus',
      type: 'select',
      label: 'Trạng thái duyệt bài',
      defaultValue: 'draft',
      options: [
        { label: '📝 Đang soạn thảo', value: 'draft' },
        { label: '⏳ Chờ biên tập duyệt', value: 'pending_review' },
        { label: '✅ Đã duyệt – Sẵn sàng xuất bản', value: 'approved' },
        { label: '❌ Bị từ chối', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Tác giả chuyển sang "Chờ duyệt" khi hoàn tất. Biên tập/Quản trị xét duyệt và xuất bản.',
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
          BlocksFeature({ blocks: [VideoBlock, TikTokBlock, PDFBlock, GalleryBlock, CalloutBlock, ButtonBlock, RelatedArticlesBlock, ColumnsBlock] }),
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
