import type { GlobalConfig } from 'payload';

// We can add more blocks here later (Video, QuickLinks, etc.)
// For now, I'll just use dummy blocks or leave it empty so we can migrate incrementally.
import { CategoryNewsBlock } from '../blocks/CategoryNews.ts';

export const Sidebar: GlobalConfig = {
  slug: 'sidebar',
  label: 'Sidebar (Thanh bên)',
  admin: {
    group: 'Giao diện',
  },
  access: {
    read: () => true,
    // Chỉ Admin mới được sửa Sidebar
    update: ({ req: { user } }: any) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'widthRatio',
      type: 'select',
      required: true,
      defaultValue: 'Sidebar 33% - Main 67%',
      options: [
        { label: 'Sidebar 25% - Main 75%', value: 'Sidebar 25% - Main 75%' },
        { label: 'Sidebar 33% - Main 67%', value: 'Sidebar 33% - Main 67%' },
        { label: 'Sidebar 50% - Main 50%', value: 'Sidebar 50% - Main 50%' },
      ],
      label: 'Tỷ lệ chiều rộng',
    },
    {
      name: 'gapSize',
      type: 'select',
      required: true,
      defaultValue: 'Vừa',
      options: [
        { label: 'Không khoảng cách', value: 'Không khoảng cách' },
        { label: 'Nhỏ', value: 'Nhỏ' },
        { label: 'Vừa', value: 'Vừa' },
        { label: 'Lớn', value: 'Lớn' },
      ],
      label: 'Khoảng cách (Gap)',
    },
    {
      name: 'blocks',
      type: 'blocks',
      blocks: [
        CategoryNewsBlock, // Reusing CategoryNews block for now
      ],
      label: 'Các khối nội dung Sidebar',
    },
  ],
};
