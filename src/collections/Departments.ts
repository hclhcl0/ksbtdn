import type { CollectionConfig } from 'payload';

export const Departments: CollectionConfig = {
  slug: 'departments',
  labels: {
    singular: 'Phòng / Khoa / Bộ phận',
    plural: 'Danh sách Phòng / Khoa / Bộ phận',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Quản trị hệ thống',
    defaultColumns: ['name', 'code', 'type', 'manager'],
    description: 'Quản lý các phòng ban, khoa, bộ phận trong đơn vị.',
  },
  access: {
    // Mọi người đăng nhập đều đọc được (để chọn phòng ban)
    read: ({ req: { user } }) => !!user,
    // Chỉ Admin mới tạo/sửa/xoá
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên phòng / khoa / bộ phận',
      admin: {
        description: 'VD: Phòng Chống bệnh truyền nhiễm, Khoa Xét nghiệm...',
      },
    },
    {
      name: 'code',
      type: 'text',
      label: 'Mã đơn vị',
      unique: true,
      admin: {
        description: 'Mã viết tắt để phân biệt nhanh. VD: P-KSBT, K-XN, P-TC...',
      },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Loại đơn vị',
      required: true,
      defaultValue: 'phong',
      options: [
        { label: 'Phòng', value: 'phong' },
        { label: 'Khoa', value: 'khoa' },
        { label: 'Bộ phận', value: 'bo-phan' },
        { label: 'Ban', value: 'ban' },
        { label: 'Trung tâm', value: 'trung-tam' },
        { label: 'Đơn vị khác', value: 'khac' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'manager',
      type: 'text',
      label: 'Trưởng đơn vị (phụ trách)',
      admin: {
        position: 'sidebar',
        description: 'Tên người phụ trách / trưởng phòng của đơn vị này.',
      },
    },
    {
      name: 'allowedCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Chuyên mục nội dung được phụ trách',
      admin: {
        description: 'Để trống = tất cả chuyên mục. Cấu hình này áp dụng cho Author thuộc phòng ban này khi allowedCategories của user không được thiết lập riêng.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả chức năng, nhiệm vụ',
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Thứ tự hiển thị',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Số nhỏ hơn hiển thị trước. Dùng để sắp xếp danh sách phòng ban.',
      },
    },
  ],
};
