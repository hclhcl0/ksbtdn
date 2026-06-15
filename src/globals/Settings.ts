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


export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Cấu hình Website',
  admin: {
    group: 'Cấu hình',
  },
  access: {
    read: () => true,
    // Chỉ Admin mới được sửa cấu hình website
    update: ({ req: { user } }: any) => user?.role === 'admin',
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
      name: 'homeNewsLayout',
      type: 'select',
      label: 'Bố cục hiển thị (Tin mới nhất)',
      defaultValue: 'grid',
      options: [
        { label: 'Lưới tin tức (Grid)', value: 'grid' },
        { label: 'Slider trượt tự động (Carousel)', value: 'slider' },
        { label: 'Danh sách chi tiết (List)', value: 'list' },
        { label: 'Danh sách rút gọn / Tin vắn (Compact)', value: 'compact' },
        { label: 'Tin tiêu điểm + Danh sách phụ (Featured)', value: 'featured' },
      ],
      admin: {
        description: 'Lựa chọn hiển thị danh sách bài viết mới dưới dạng lưới tĩnh hoặc slider trượt tự động.',
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
        },
        {
          name: 'fontFamily',
          type: 'select',
          label: 'Font chữ toàn trang (Google Fonts)',
          defaultValue: 'Inter',
          options: [
            { label: 'Inter (Mặc định)', value: 'Inter' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Be Vietnam Pro (Tiếng Việt)', value: 'Be+Vietnam+Pro' },
            { label: 'Noto Sans (Tiếng Việt)', value: 'Noto+Sans' },
            { label: 'Source Sans 3', value: 'Source+Sans+3' },
            { label: 'Nunito', value: 'Nunito' },
            { label: 'Outfit', value: 'Outfit' },
            { label: 'Plus Jakarta Sans', value: 'Plus+Jakarta+Sans' },
            { label: 'Montserrat (Tiếng Việt)', value: 'Montserrat' },
            { label: 'Open Sans (Tiếng Việt)', value: 'Open+Sans' },
            { label: 'Mulish (Tiếng Việt)', value: 'Mulish' },
            { label: 'Lexend (Tiếng Việt)', value: 'Lexend' },
            { label: 'Noto Serif (Tiếng Việt - Serif)', value: 'Noto+Serif' },
            { label: 'Lora (Tiếng Việt - Serif)', value: 'Lora' },
            { label: 'Barlow (Tiếng Việt)', value: 'Barlow' },
            { label: 'Cabin (Tiếng Việt)', value: 'Cabin' },
            { label: 'Comfortaa (Tiếng Việt)', value: 'Comfortaa' },
          ],
          admin: {
            description: 'Chọn font chữ chính hiển thị trên toàn bộ website. Font sẽ được tải từ Google Fonts và áp dụng tức thì sau khi lưu.',
          }
        }
      ]
    },
    {
      name: 'homeSections',
      type: 'blocks',
      label: 'Các thành phần trên Trang chủ',
      labels: {
        singular: 'Thành phần',
        plural: 'Danh sách thành phần',
      },
      admin: {
        description: 'Kéo thả để sắp xếp thứ tự hiển thị. Mỗi thành phần là một khu vực riêng biệt trên trang chủ.',
      },
      blocks: [
        // ── Block 1: Khu vực tin tức theo chuyên mục ──
        {
          slug: 'newsCategorySection',
          interfaceName: 'NewsCategorySection',
          labels: { singular: '📰 Khu vực Tin tức Chuyên mục', plural: 'Khu vực Tin tức Chuyên mục' },
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
                description: 'Số bài viết = Số hàng × Số cột (cấu hình ở trên).',
              },
            },
            {
              name: 'layout',
              type: 'select',
              label: 'Bố cục hiển thị',
              defaultValue: 'grid',
              options: [
                { label: 'Lưới tin tức (Grid)', value: 'grid' },
                { label: 'Slider trượt tự động (Carousel)', value: 'slider' },
                { label: 'Danh sách chi tiết (List)', value: 'list' },
                { label: 'Danh sách rút gọn / Tin vắn (Compact)', value: 'compact' },
                { label: 'Tin tiêu điểm + Danh sách phụ (Featured)', value: 'featured' },
              ],
            },
          ],
        },

        // ── Block 2: Banner hình ảnh ──
        {
          slug: 'bannerSection',
          interfaceName: 'BannerSection',
          labels: { singular: '🖼️ Banner Hình ảnh', plural: 'Banner Hình ảnh' },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Hình ảnh banner',
            },
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề (tùy chọn)',
            },
            {
              name: 'subtitle',
              type: 'text',
              label: 'Mô tả ngắn (tùy chọn)',
            },
            {
              name: 'linkUrl',
              type: 'text',
              label: 'Đường dẫn khi nhấn vào banner',
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              label: 'Mở liên kết trong tab mới',
              defaultValue: false,
            },
            {
              name: 'style',
              type: 'select',
              label: 'Kiểu hiển thị',
              defaultValue: 'fullwidth',
              options: [
                { label: 'Toàn chiều rộng (Full-width)', value: 'fullwidth' },
                { label: 'Thẻ có bo góc (Card)', value: 'card' },
              ],
            },
          ],
        },

        // ── Block 3: Khu vực Video YouTube ──
        {
          slug: 'videoSection',
          interfaceName: 'VideoSection',
          labels: { singular: '🎬 Khu vực Video YouTube', plural: 'Khu vực Video YouTube' },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề khu vực',
              defaultValue: 'VIDEO NỔI BẬT',
            },
            {
              name: 'channel',
              type: 'relationship',
              relationTo: 'video-channels',
              label: 'Chọn kênh YouTube hiển thị',
              required: true,
            },
            {
              name: 'limit',
              type: 'number',
              label: 'Số video hiển thị',
              defaultValue: 4,
              min: 1,
              max: 12,
            },
            {
              name: 'layout',
              type: 'select',
              label: 'Bố cục video',
              defaultValue: 'grid',
              options: [
                { label: 'Lưới (Grid)', value: 'grid' },
                { label: 'Video chính + Danh sách phụ', value: 'featured' },
              ],
            },
          ],
        },

        // ── Block 4: Khu vực TikTok ──
        {
          slug: 'tiktokSection',
          interfaceName: 'TiktokSection',
          labels: { singular: '📱 Khu vực TikTok', plural: 'Khu vực TikTok' },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề khu vực',
              defaultValue: 'KÊNH TIKTOK CDC ĐÀ NẴNG',
            },
            {
              name: 'channel',
              type: 'relationship',
              relationTo: 'video-channels',
              label: 'Chọn kênh TikTok hiển thị',
              required: true,
            },
            {
              name: 'limit',
              type: 'number',
              label: 'Số video TikTok hiển thị',
              defaultValue: 4,
              min: 1,
              max: 8,
            },
          ],
        },

        // ── Block 5: Thống kê / Số liệu nổi bật ──
        {
          slug: 'statsSection',
          interfaceName: 'StatsSection',
          labels: { singular: '📊 Thống kê / Số liệu', plural: 'Thống kê / Số liệu' },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề khu vực (tùy chọn)',
            },
            {
              name: 'backgroundColor',
              type: 'select',
              label: 'Màu nền',
              defaultValue: 'primary',
              options: [
                { label: 'Màu chủ đạo (Primary)', value: 'primary' },
                { label: 'Màu trắng / Sáng', value: 'light' },
                { label: 'Màu xám nhạt', value: 'gray' },
              ],
            },
            {
              name: 'stats',
              type: 'array',
              label: 'Danh sách chỉ số thống kê',
              minRows: 1,
              maxRows: 6,
              labels: { singular: 'Chỉ số', plural: 'Các chỉ số' },
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  label: 'Icon (emoji hoặc tên icon)',
                  defaultValue: '🏥',
                  admin: { description: 'Dán emoji vào đây, VD: 🏥 🧪 💉 👥 🌐' },
                },
                {
                  name: 'value',
                  type: 'text',
                  label: 'Con số / Giá trị',
                  required: true,
                  admin: { description: 'VD: 1,200 hoặc 99% hoặc 50+' },
                },
                {
                  name: 'label',
                  type: 'text',
                  label: 'Nhãn / Tên chỉ số',
                  required: true,
                  admin: { description: 'VD: Ca bệnh được điều trị' },
                },
                {
                  name: 'suffix',
                  type: 'text',
                  label: 'Hậu tố (tùy chọn)',
                  admin: { description: 'VD: ca, %, trạm, người' },
                },
              ],
            },
          ],
        },

        // ── Block 6: Liên kết nhanh / Dịch vụ trực tuyến ──
        {
          slug: 'quickLinksSection',
          interfaceName: 'QuickLinksSection',
          labels: { singular: '⚡ Liên kết nhanh / Dịch vụ', plural: 'Liên kết nhanh / Dịch vụ' },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tiêu đề khu vực',
              defaultValue: 'DỊCH VỤ TRỰC TUYẾN',
            },
            {
              name: 'links',
              type: 'array',
              label: 'Danh sách liên kết',
              minRows: 1,
              maxRows: 12,
              labels: { singular: 'Liên kết', plural: 'Các liên kết' },
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  label: 'Icon (emoji)',
                  defaultValue: '🔗',
                  admin: { description: 'Dán emoji, VD: 📋 🏥 💊 🧾 📞 🌐' },
                },
                {
                  name: 'label',
                  type: 'text',
                  label: 'Tên liên kết / Dịch vụ',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Đường dẫn URL',
                  required: true,
                },
                {
                  name: 'openInNewTab',
                  type: 'checkbox',
                  label: 'Mở trong tab mới',
                  defaultValue: true,
                },
                {
                  name: 'color',
                  type: 'select',
                  label: 'Màu thẻ',
                  defaultValue: 'primary',
                  options: [
                    { label: 'Màu chủ đạo', value: 'primary' },
                    { label: 'Màu phụ / Xanh dương', value: 'secondary' },
                    { label: 'Xanh lá', value: 'green' },
                    { label: 'Cam', value: 'orange' },
                    { label: 'Đỏ', value: 'red' },
                    { label: 'Tím', value: 'purple' },
                    { label: 'Xám', value: 'gray' },
                  ],
                },
              ],
            },
          ],
        },

        // ── Block 7: Nội dung tự do (RichText) ──
        {
          slug: 'richTextSection',
          interfaceName: 'RichTextSection',
          labels: { singular: '✍️ Nội dung tự do (RichText)', plural: 'Nội dung tự do' },
          fields: [
            {
              name: 'content',
              type: 'richText',
              label: 'Nội dung',
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
                      CardBlock,
                    ],
                  }),
                ],
              }),
            },
          ],
        },
      ],
    },
    {
      name: 'aiChatSettings',
      type: 'group',
      label: '🤖 Cài đặt AI Chat (Hỏi đáp tự động)',
      admin: {
        description: 'Cấu hình widget hỏi đáp AI hiển thị cho người dân trên website.',
      },
      fields: [
        {
          name: 'chatEnabled',
          type: 'checkbox',
          label: 'Bật widget AI Chat trên website',
          defaultValue: true,
          admin: {
            description: 'Tích vào để hiển thị nút chat AI ở góc dưới phải trang web.',
          },
        },
        {
          name: 'geminiApiKeys',
          type: 'textarea',
          label: 'Gemini API Keys',
          admin: {
            description: 'Nhập mỗi API key trên một dòng riêng. Hệ thống tự xoay vòng (round-robin) để tránh giới hạn tốc độ. Lấy key miễn phí tại: aistudio.google.com',
            rows: 6,
            placeholder: 'AIzaSy...\nAIzaSy...',
          },
        },
        {
          name: 'chatWelcomeMessage',
          type: 'text',
          label: 'Tin nhắn chào mừng',
          defaultValue: 'Xin chào! Tôi là Trợ lý AI của CDC Đà Nẵng. Tôi có thể giúp gì cho bạn hôm nay?',
          admin: {
            description: 'Tin nhắn đầu tiên AI hiển thị khi người dùng mở hộp chat.',
          },
        },
        {
          name: 'chatCustomPrompt',
          type: 'textarea',
          label: 'Hướng dẫn bổ sung cho AI (tùy chọn)',
          admin: {
            description: 'Các quy tắc đặc biệt muốn AI tuân theo. Để trống nếu không cần.',
            rows: 4,
            placeholder: 'Ví dụ: Luôn nhắc hotline 1900988975 ở cuối mỗi câu trả lời...',
          },
        },
      ],
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
