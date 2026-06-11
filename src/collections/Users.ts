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
      required: true,
      defaultValue: 'author',
      options: [
        { label: 'Quản trị viên (Admin)', value: 'admin' },
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
      name: 'name',
      type: 'text',
      label: 'Họ và tên',
    },
  ],
};
