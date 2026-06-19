import type { CollectionConfig } from 'payload';

export const ZaloStaffLinks: CollectionConfig = {
  slug: 'zalo-staff-links',
  labels: {
    singular: 'Liên kết nhân viên Zalo',
    plural: 'Liên kết nhân viên Zalo',
  },
  admin: {
    useAsTitle: 'staffName',
    defaultColumns: ['staffName', 'zaloUserId', 'department', 'registeredAt'],
    group: 'Cấu hình',
  },
  fields: [
    { name: 'staffNameRaw', type: 'text', required: true, label: 'Tên gốc' },
    { name: 'staffName', type: 'text', required: true, label: 'Tên chuẩn hóa' },
    { name: 'zaloUserId', type: 'text', required: true, unique: true, label: 'Zalo User ID' },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      hasMany: false,
      label: 'Phòng ban',
    },
    { name: 'phone', type: 'text', label: 'Số điện thoại' },
    { name: 'registeredAt', type: 'date', defaultValue: () => new Date(), label: 'Ngày đăng ký' },
  ],
};
