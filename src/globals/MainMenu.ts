import type { GlobalConfig } from 'payload';

export const MainMenu: GlobalConfig = {
  slug: 'main-menu',
  label: 'Menu Điều Hướng',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'menuPosition',
      type: 'select',
      label: 'Vị trí Menu điều hướng',
      defaultValue: 'below',
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
      label: 'Danh sách Menu',
      defaultValue: [
        { label: 'Home', url: '/' },
        { label: 'Giới thiệu', url: '/category/gioi-thieu/' },
        { label: 'Sức khỏe', url: '/category/van-de-suc-khoe/' },
        { label: 'Dịch vụ', url: '/category/hoat-dong-dich-vu/' },
        { label: 'Đào tạo', url: '/category/dao-tao/' },
        { label: 'Công đoàn', url: '/category/hoat-dong-cong-doan/' },
        { label: 'Mua sắm', url: '/category/thong-tin-mua-sam/' },
        { label: 'Hành chính', url: '#' },
        { label: 'Liên Hệ', url: '/lien-he.html' }
      ],
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
  ],
};
