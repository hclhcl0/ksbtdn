import type { CollectionConfig } from 'payload';

export const ZaloFollowers: CollectionConfig = {
  slug: 'zalo-followers',
  labels: {
    singular: 'Người theo dõi Zalo',
    plural: 'Người theo dõi Zalo',
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'zaloUserId', 'phone', 'userType'],
    group: 'Zalo OA',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    { name: 'zaloUserId', type: 'text', required: true, unique: true, label: 'Zalo User ID' },
    { name: 'displayName', type: 'text', label: 'Tên hiển thị' },
    { name: 'avatarUrl', type: 'text', label: 'URL Ảnh đại diện' },
    { name: 'phone', type: 'text', label: 'Số điện thoại' },
    { name: 'followedAt', type: 'date', defaultValue: () => new Date(), label: 'Ngày theo dõi' },
    { name: 'userType', type: 'select', defaultValue: 'citizen', options: [{ label: 'Người dân', value: 'citizen' }, { label: 'Nhân viên', value: 'staff' }], label: 'Loại người dùng' },
    { name: 'accessLevel', type: 'select', defaultValue: 'basic', options: [{ label: 'Cơ bản', value: 'basic' }, { label: 'Quản lý', value: 'manager' }, { label: 'Nhân sự', value: 'hr' }, { label: 'Admin', value: 'admin' }], label: 'Cấp quyền' },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      hasMany: false,
      label: 'Phòng ban',
      admin: { description: 'Chỉ áp dụng nếu là nhân viên CDC.' },
    },
    { name: 'notes', type: 'textarea', label: 'Ghi chú' },
    { name: 'fullName', type: 'text', label: 'Tên thật (Bệnh nhân)' },
    { name: 'dob', type: 'text', label: 'Ngày sinh' },
    { name: 'cccd', type: 'text', label: 'CCCD / Mã BN' },
  ],
};
