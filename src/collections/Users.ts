import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Tài khoản',
    plural: 'Danh sách tài khoản',
  },
  admin: {
    useAsTitle: 'email',
    group: 'Quản trị hệ thống',
  },
  auth: true,
  access: {
    // Chỉ Admin mới được xem và quản lý danh sách user, hoặc user tự xem chính mình
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return {
        id: {
          equals: user.id,
        },
      };
    },
    create: ({ req: { user } }) => {
      if (!user) return true; // Cho phép tạo user đầu tiên khi hệ thống trống, Payload tự xử lý logic first user.
      return user.role === 'admin';
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return {
        id: {
          equals: user.id,
        },
      };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      label: 'Vai trò / Quyền hạn',
      required: true,
      defaultValue: 'author',
      options: [
        { label: 'Quản trị viên (Admin)', value: 'admin' },
        { label: 'Kiểm duyệt viên (Moderator)', value: 'moderator' },
        { label: 'Biên tập viên (Editor)', value: 'editor' },
        { label: 'Cộng tác viên/Tác giả (Author)', value: 'author' },
        { label: 'Người dùng (User)', value: 'user' },
      ],
      access: {
        // Chỉ admin mới được sửa quyền của người khác (và của chính mình)
        update: ({ req: { user } }) => {
          return user?.role === 'admin';
        },
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'department',
      type: 'select',
      label: 'Phòng / Khoa / Bộ phận',
      options: [
        { label: 'Phòng chống bệnh truyền nhiễm', value: 'Phòng chống bệnh truyền nhiễm' },
        { label: 'Kiểm dịch Y tế quốc tế', value: 'Kiểm dịch Y tế quốc tế' },
        { label: 'Ký sinh trùng - Côn trùng', value: 'Ký sinh trùng - Côn trùng' },
        { label: 'Phòng chống bệnh không lây nhiễm', value: 'Phòng chống bệnh không lây nhiễm' },
        { label: 'Sức khoẻ môi trường - YTTH', value: 'Sức khoẻ môi trường - YTTH' },
        { label: 'Sức khoẻ sinh sản', value: 'Sức khoẻ sinh sản' },
        { label: 'Dinh dưỡng', value: 'Dinh dưỡng' },
        { label: 'Phòng chống HIV/AIDS - ĐTNC', value: 'Phòng chống HIV/AIDS - ĐTNC' },
        { label: 'Truyền thông giáo dục sức khoẻ', value: 'Truyền thông giáo dục sức khoẻ' },
        { label: 'Phòng khám đa khoa', value: 'Phòng khám đa khoa' },
        { label: 'Bệnh nghề nghiệp', value: 'Bệnh nghề nghiệp' },
        { label: 'Xét nghiệm – CĐHA - TDCN', value: 'Xét nghiệm – CĐHA - TDCN' },
        { label: 'Dược – VTYT', value: 'Dược – VTYT' },
        { label: 'Tổ chức - Hành chính', value: 'Tổ chức - Hành chính' },
        { label: 'Tài chính - Kế toán', value: 'Tài chính - Kế toán' },
        { label: 'Kế hoạch - Nghiệp vụ', value: 'Kế hoạch - Nghiệp vụ' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Phòng ban công tác. Chỉ áp dụng cho Nhân viên/Tác giả.',
      },
    },
    {
      name: 'name',
      type: 'text',
      label: 'Họ và tên',
    },
    {
      name: 'allowedCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Chuyên mục được phép viết bài',
      admin: {
        description: 'Để trống = không giới hạn chuyên mục. Chỉ áp dụng cho Cộng tác viên (Author).',
        position: 'sidebar',
        condition: (data: any) => data?.role === 'author',
      },
    },
  ],
};
