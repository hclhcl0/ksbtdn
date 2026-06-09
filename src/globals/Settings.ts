import type { GlobalConfig } from 'payload';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';
import { CalloutBlock } from '../blocks/CalloutBlock.ts';
import { ButtonBlock } from '../blocks/ButtonBlock.ts';
import { RelatedArticlesBlock } from '../blocks/RelatedArticlesBlock.ts';
import { ColumnsBlock } from '../blocks/ColumnsBlock.ts';
import { CardBlock } from '../blocks/CardBlock.ts';
import { VideoBlock } from '../blocks/VideoBlock.ts';
import { TikTokBlock } from '../blocks/TikTokBlock.ts';
import { PDFBlock } from '../blocks/PDFBlock.ts';
import { GalleryBlock } from '../blocks/GalleryBlock.ts';

console.log("DEBUG PAYLOAD BLOCKS IN SETTINGS:", {
  ColumnsBlock: !!ColumnsBlock,
  VideoBlock: !!VideoBlock,
  TikTokBlock: !!TikTokBlock,
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
              TikTokBlock,
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
    },
    {
      name: 'sidebarWidgets',
      type: 'blocks',
      label: 'Các Tiện Ích Thanh Bên (Sidebar Widgets)',
      labels: {
        singular: 'Tiện ích',
        plural: 'Danh sách tiện ích',
      },
      blocks: [
        {
          slug: 'categoriesWidget',
          interfaceName: 'CategoriesWidget',
          labels: { singular: 'Widget Chuyên mục', plural: 'Widget Chuyên mục' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề tiện ích', defaultValue: 'Chuyên mục', required: true },
            { name: 'limit', type: 'number', label: 'Giới hạn số chuyên mục hiển thị', defaultValue: 10 },
          ]
        },
        {
          slug: 'recentArticlesWidget',
          interfaceName: 'RecentArticlesWidget',
          labels: { singular: 'Widget Bài viết mới', plural: 'Widget Bài viết mới' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề tiện ích', defaultValue: 'Tin mới cập nhật', required: true },
            { name: 'limit', type: 'number', label: 'Số lượng bài viết hiển thị', defaultValue: 5, min: 1, max: 15 },
          ]
        },
        {
          slug: 'tiktokWidget',
          interfaceName: 'TiktokWidget',
          labels: { singular: 'Widget TikTok Player', plural: 'Widget TikTok Player' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề tiện ích', defaultValue: 'Kênh TikTok CDC' },
            { name: 'channel', type: 'relationship', relationTo: 'video-channels', label: 'Chọn Kênh TikTok hiển thị', required: true },
          ]
        },
        {
          slug: 'facebookWidget',
          interfaceName: 'FacebookWidget',
          labels: { singular: 'Widget Facebook Fanpage', plural: 'Widget Facebook Fanpage' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề tiện ích', defaultValue: 'Fanpage CDC' },
            { name: 'pageUrl', type: 'text', label: 'Đường dẫn Trang Facebook (URL)', defaultValue: 'https://www.facebook.com/cdcdanang', required: true },
            { name: 'height', type: 'number', label: 'Chiều cao khung nhúng (px)', defaultValue: 350 },
          ]
        },
        {
          slug: 'bannerWidget',
          interfaceName: 'BannerWidget',
          labels: { singular: 'Widget Banner Quảng cáo', plural: 'Widget Banner Quảng cáo' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề (Không bắt buộc)' },
            { name: 'image', type: 'upload', relationTo: 'media', label: 'Tải ảnh Banner lên', required: true },
            { name: 'linkUrl', type: 'text', label: 'Đường dẫn liên kết khi nhấn vào banner' },
            { name: 'openInNewTab', type: 'checkbox', label: 'Mở liên kết trong tab mới', defaultValue: true },
          ]
        },
        {
          slug: 'customHtmlWidget',
          interfaceName: 'CustomHtmlWidget',
          labels: { singular: 'Widget HTML tùy chỉnh', plural: 'Widget HTML tùy chỉnh' },
          fields: [
            { name: 'title', type: 'text', label: 'Tiêu đề tiện ích' },
            { name: 'htmlContent', type: 'textarea', label: 'Mã nhúng HTML / Iframe / Scripts', required: true, admin: { rows: 6 } },
          ]
        }
      ]
    },
  ],
};
