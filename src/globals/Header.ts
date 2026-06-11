import type { GlobalConfig } from 'payload';

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header (Cấu hình chung)',
  admin: {
    group: 'Giao diện',
  },
  access: {
    read: () => true,
    // Chỉ Admin mới được sửa cấu hình giao diện
    update: ({ req: { user } }: any) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng',
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
          defaultValue: 80,
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
          defaultValue: 'Phòng bệnh chủ động-vươn rộng tương lai',
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
          defaultValue: 'bounce',
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
          defaultValue: 'navbar',
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
          defaultValue: 'popup',
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
      name: 'hotline',
      type: 'group',
      label: 'Đường dây nóng (Hotline Bar)',
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Số điện thoại',
          defaultValue: '0236 3890 407',
        },
        {
          name: 'actionLink',
          type: 'text',
          label: 'Link Nút "Đặt câu hỏi"',
          defaultValue: '#',
        },
        {
          name: 'position',
          type: 'select',
          label: 'Vị trí Hotline Bar',
          defaultValue: 'topbar',
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
