import type { GlobalConfig } from 'payload';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';
import { CalloutBlock } from '../blocks/CalloutBlock.ts';
import { ButtonBlock } from '../blocks/ButtonBlock.ts';
import { RelatedArticlesBlock } from '../blocks/RelatedArticlesBlock.ts';
import { ColumnsBlock } from '../blocks/ColumnsBlock.ts';
import { CardBlock } from '../blocks/CardBlock.ts';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { PDFBlock } from '../blocks/PDFBlock.ts';
import { GalleryBlock } from '../blocks/GalleryBlock.ts';

console.log("DEBUG PAYLOAD BLOCKS IN SETTINGS:", {
  ColumnsBlock: !!ColumnsBlock,
  VideoBlock: !!VideoBlock,
  PDFBlock: !!PDFBlock,
  GalleryBlock: !!GalleryBlock,
  CalloutBlock: !!CalloutBlock,
  ButtonBlock: !!ButtonBlock,
  RelatedArticlesBlock: !!RelatedArticlesBlock,
  CardBlock: !!CardBlock,
});

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Cấu hình chung (Settings)',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'homeNewsLimit',
      type: 'number',
      label: 'Số hàng hiển thị (Tin mới nhất)',
      defaultValue: 2,
      min: 1,
      max: 20,
      required: true,
      admin: {
        description: 'Số lượng bài viết sẽ tự động được tính bằng (Số hàng x Số cột). Áp dụng cho khối THÔNG TIN MỚI NHẤT.',
      }
    },
    {
      name: 'homeNewsColumnsDesktop',
      type: 'number',
      label: 'Số bài viết trên 1 hàng (Máy tính)',
      defaultValue: 5,
      min: 1,
      max: 6,
      required: true,
      admin: {
        description: 'Tuỳ chỉnh số lượng thẻ bài viết hiển thị trên cùng một hàng đối với giao diện màn hình lớn.',
      }
    },
    {
      name: 'homeNewsColumnsMobile',
      type: 'number',
      label: 'Số bài viết trên 1 hàng (Điện thoại)',
      defaultValue: 2,
      min: 1,
      max: 4,
      required: true,
      admin: {
        description: 'Tuỳ chỉnh số lượng thẻ bài viết hiển thị trên cùng một hàng đối với giao diện điện thoại.',
      }
    },
    {
      name: 'heroSliderSize',
      type: 'select',
      label: 'Kích thước Slider Banner trang chủ',
      options: [
        { label: 'Nhỏ', value: 'small' },
        { label: 'Vừa', value: 'medium' },
        { label: 'Lớn', value: 'large' },
        { label: 'Tùy chỉnh', value: 'custom' },
      ],
      defaultValue: 'medium',
      admin: {
        hidden: true,
      }
    },
    {
      name: 'heroSliderCustomHeight',
      type: 'number',
      label: 'Chiều cao tự gõ (px)',
      admin: {
        hidden: true,
      }
    },
    {
      name: 'heroSliderEffect',
      type: 'select',
      label: 'Hiệu ứng chuyển ảnh Banner',
      options: [
        { label: '🔄 Trượt ngang (Slide)', value: 'slide' },
        { label: '✨ Mờ dần (Fade)', value: 'fade' },
        { label: '🔳 Thu phóng (Zoom)', value: 'zoom' },
        { label: '📦 Lật (Flip)', value: 'flip' },
      ],
      defaultValue: 'slide',
      admin: {
        hidden: true,
      }
    },
    {
      name: 'homeContent',
      type: 'richText',
      label: 'Nội dung giới thiệu trang chủ (Kéo thả tự do)',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({
            blocks: [
              ColumnsBlock,
              VideoBlock,
              PDFBlock,
              GalleryBlock,
              CalloutBlock,
              ButtonBlock,
              RelatedArticlesBlock,
              CardBlock
            ],
          }),
        ],
      }),
      admin: {
        description: 'Phần này sẽ hiển thị ở trang chủ, ngay bên dưới Slider Banner và bên trên Danh sách tin tức.',
      }
    },
    {
      name: 'themeConfig',
      type: 'group',
      label: 'Tùy chỉnh giao diện (Theme)',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          label: 'Màu chủ đạo (Primary Color)',
          defaultValue: '#007a8c',
          admin: {
            components: {
              Field: '@/components/ColorPickerField.tsx#ColorPickerField',
            },
            description: 'Màu chính của trang web (VD: #007a8c).',
          }
        },
        {
          name: 'primaryDarkColor',
          type: 'text',
          label: 'Màu chủ đạo đậm (Hover)',
          defaultValue: '#005a68',
          admin: {
            components: {
              Field: '@/components/ColorPickerField.tsx#ColorPickerField',
            },
            description: 'Màu khi rê chuột (hover) vào các nút bấm hoặc liên kết (VD: #005a68).',
          }
        },
        {
          name: 'secondaryColor',
          type: 'text',
          label: 'Màu phụ / Nhấn (Secondary Color)',
          defaultValue: '#4999d6',
          admin: {
            components: {
              Field: '@/components/ColorPickerField.tsx#ColorPickerField',
            },
            description: 'Màu tạo điểm nhấn cho các họa tiết phụ (VD: #4999d6).',
          }
        }
      ]
    },
    {
      name: 'homeCategories',
      type: 'array',
      label: 'Các khu vực chuyên mục hiển thị trên Trang chủ',
      labels: {
        singular: 'Khu vực chuyên mục',
        plural: 'Các khu vực chuyên mục',
      },
      fields: [
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          required: true,
          label: 'Chọn chuyên mục',
        },
        {
          name: 'limit',
          type: 'number',
          label: 'Số hàng hiển thị',
          defaultValue: 2,
          min: 1,
          max: 20,
          required: true,
          admin: {
            description: 'Số bài viết sẽ tự động tính bằng (Số hàng x Số cột Máy tính).',
          }
        }
      ]
    }
  ],
};
