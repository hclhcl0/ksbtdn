import type { GlobalConfig } from 'payload';

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header (Cấu hình chung)',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Cổng thông tin điện tử',
      label: 'Tên Website',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      name: 'logoCustomization',
      type: 'group',
      label: 'Tùy chỉnh Logo',
      fields: [
        {
          name: 'logoHeight',
          type: 'number',
          label: 'Chiều cao Logo (px)',
          defaultValue: 52,
          min: 20,
          max: 200,
          admin: {
            description: 'Điều chỉnh chiều cao logo. Chiều rộng sẽ tự động co giãn theo tỷ lệ.',
          }
        },
        {
          name: 'logoPosition',
          type: 'select',
          label: 'Căn chỉnh Logo',
          defaultValue: 'left',
          options: [
            { label: '⬅ Căn trái', value: 'left' },
            { label: '⬛ Căn giữa', value: 'center' },
            { label: '➡ Căn phải', value: 'right' },
          ],
        },
        {
          name: 'showSiteName',
          type: 'checkbox',
          label: 'Hiển thị tên website bên cạnh Logo',
          defaultValue: true,
        },
        {
          name: 'siteNameLine1',
          type: 'text',
          label: 'Dòng chữ thứ nhất bên cạnh Logo',
          defaultValue: 'TRUNG TÂM KIỂM SOÁT BỆNH TẬT',
          admin: {
            condition: (data) => data?.logoCustomization?.showSiteName !== false,
          }
        },
        {
          name: 'siteNameLine2',
          type: 'text',
          label: 'Dòng chữ thứ hai bên cạnh Logo',
          defaultValue: 'THÀNH PHỐ ĐÀ NẴNG',
          admin: {
            condition: (data) => data?.logoCustomization?.showSiteName !== false,
          }
        },
        {
          name: 'siteTagline',
          type: 'text',
          label: 'Slogan / Tagline (bên dưới tên website)',
          admin: {
            description: 'Dòng phụ nhỏ hiển thị bên dưới tên website. Để trống nếu không cần.',
            condition: (data) => data?.logoCustomization?.showSiteName !== false,
          }
        },
        {
          name: 'logoBannerImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Hình ảnh bên dưới Logo (không bắt buộc)',
          admin: {
            description: 'Ảnh phụ nhỏ hiển thị bên dưới logo (VD: slogan hình ảnh, ribbon, seal).',
          }
        },
        {
          name: 'mobileLogo',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo riêng trên Điện thoại (Không bắt buộc)',
          admin: {
            description: 'Tải lên logo rút gọn hoặc logo riêng cho điện thoại. Để trống để sử dụng logo mặc định.',
          }
        },
        {
          name: 'mobileLogoHeight',
          type: 'number',
          label: 'Chiều cao Logo trên Điện thoại (px)',
          defaultValue: 40,
          min: 15,
          max: 100,
          admin: {
            description: 'Điều chỉnh chiều cao logo khi hiển thị trên điện thoại.',
          }
        },
        {
          name: 'logoHoverEffect',
          type: 'select',
          label: 'Hiệu ứng rê chuột vào Logo (Hover)',
          defaultValue: 'scale-tilt',
          options: [
            { label: 'Không có hiệu ứng', value: 'none' },
            { label: 'Phóng to & nghiêng (Scale & Tilt)', value: 'scale-tilt' },
            { label: 'Phóng to & phát sáng (Scale & Glow)', value: 'glow' },
            { label: 'Nhảy nhẹ lên (Bounce)', value: 'bounce' }
          ],
        },
        {
          name: 'mobileShowSiteName',
          type: 'checkbox',
          label: 'Hiển thị tên website cạnh Logo trên Điện thoại',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'searchCustomization',
      type: 'group',
      label: 'Tùy chỉnh Ô Tìm Kiếm',
      fields: [
        {
          name: 'position',
          type: 'select',
          label: 'Vị trí đặt ô Tìm kiếm',
          defaultValue: 'hotline',
          options: [
            { label: '⬇ Trong thanh Hotline (Mặc định)', value: 'hotline' },
            { label: '➡ Trên thanh điều hướng chính (MainMenu)', value: 'navbar' },
            { label: '➡ Bên phải thanh Menu điều hướng', value: 'menu' },
            { label: '➡ Bên phải Đăng nhập/Đăng ký (TopBar)', value: 'topbar' },
            { label: '❌ Ẩn nút tìm kiếm', value: 'hidden' },
          ],
        },
        {
          name: 'style',
          type: 'select',
          label: 'Cách hiển thị',
          defaultValue: 'inline',
          options: [
            { label: '🔍 Ô nhập trực tiếp (Inline Input)', value: 'inline' },
            { label: '📱 Nút icon kích hoạt Popup (Search Popup)', value: 'popup' },
          ],
        },
        {
          name: 'width',
          type: 'number',
          label: 'Chiều rộng ô nhập trực tiếp (px)',
          defaultValue: 250,
          min: 150,
          max: 600,
          admin: {
            description: 'Độ rộng ô tìm kiếm dạng trực tiếp (inline). Dạng popup sẽ tự động chiếm toàn màn hình.',
            condition: (data) => data?.searchCustomization?.style !== 'popup',
          }
        }
      ]
    },
    {
      name: 'menuPosition',
      type: 'select',
      label: 'Vị trí Menu điều hướng',
      defaultValue: 'right',
      options: [
        { label: '➡ Bên phải Logo (cùng hàng)', value: 'right' },
        { label: '⬇ Thanh riêng bên dưới Logo', value: 'below' },
        { label: '⬅ Bên trái Logo (cùng hàng)', value: 'left' },
      ],
      admin: {
        description: 'Chọn nơi hiển thị thanh menu điều hướng chính.',
      }
    },
    {
      name: 'menuItems',
      type: 'array',
      label: 'Menu Điều Hướng',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Tên Menu (Ví dụ: Giới thiệu)',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Đường dẫn (để trống nếu chỉ là tiêu đề nhóm)',
        },
        {
          name: 'subItems',
          type: 'array',
          label: 'Menu Con (Dropdown)',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Tên mục con',
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'Đường dẫn',
            },
          ],
        },
      ],
    },
    {
      name: 'hotline',
      type: 'group',
      label: 'Đường dây nóng (Hotline Bar)',
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Số điện thoại',
          defaultValue: '0909 408 895',
        },
        {
          name: 'actionLink',
          type: 'text',
          label: 'Link Nút "Đặt câu hỏi"',
          defaultValue: 'https://facebook.com/ksbthcm',
        },
        {
          name: 'position',
          type: 'select',
          label: 'Vị trí Hotline Bar',
          defaultValue: 'below-nav',
          options: [
            { label: '⬇ Dưới thanh điều hướng (Mặc định)', value: 'below-nav' },
            { label: '⬆ Trên thanh điều hướng (Dưới TopBar)', value: 'above-nav' },
            { label: '🔝 Trên cùng của trang (Trên cả TopBar)', value: 'very-top' },
            { label: '➡ Bên phải Đăng nhập/Đăng ký (TopBar)', value: 'topbar' },
          ],
        },
      ]
    },
    {
      name: 'socialLinks',
      type: 'group',
      label: 'Mạng xã hội (Top Bar)',
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook URL' },
        { name: 'youtube', type: 'text', label: 'Youtube URL' },
        { name: 'twitter', type: 'text', label: 'Twitter URL' },
        { name: 'instagram', type: 'text', label: 'Instagram URL' },
      ]
    }
  ],
};
