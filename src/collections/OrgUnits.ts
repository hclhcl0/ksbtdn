import type { CollectionConfig } from 'payload';

export const OrgUnits: CollectionConfig = {
  slug: 'org-units',
  labels: {
    singular: 'Phòng/Khoa/Ban',
    plural: 'Cơ cấu tổ chức',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'unitType', 'order'],
    group: 'Giới thiệu',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      if (!user) return false;
      return ['admin', 'editor'].includes(user.role as string);
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      return ['admin', 'editor'].includes(user.role as string);
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Tên đơn vị',
      required: true,
    },
    {
      name: 'unitType',
      type: 'select',
      label: 'Loại đơn vị',
      required: true,
      defaultValue: 'khoa',
      options: [
        { label: 'Ban lãnh đạo', value: 'ban_lanh_dao' },
        { label: 'Phòng chức năng', value: 'phong' },
        { label: 'Khoa chuyên môn', value: 'khoa' },
        { label: 'Trung tâm / Đơn vị khác', value: 'khac' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Thứ tự hiển thị',
      defaultValue: 99,
      admin: {
        position: 'sidebar',
        description: 'Số nhỏ hơn hiển thị trước. Ban GĐ nên để 1.',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Chức năng / Nhiệm vụ ngắn',
      admin: {
        description: 'Mô tả ngắn chức năng của phòng/khoa (1-3 câu)',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh đại diện đơn vị',
      admin: {
        description: 'Ảnh bìa/logo của phòng/khoa (không bắt buộc)',
      },
    },
    {
      name: 'members',
      type: 'array',
      label: 'Danh sách nhân sự',
      admin: {
        description: 'Thêm từng nhân viên trong đơn vị này',
        initCollapsed: false,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'memberName',
              type: 'text',
              label: 'Họ và tên',
              required: true,
              admin: {
                width: '50%',
              },
            },
            {
              name: 'position',
              type: 'select',
              label: 'Chức vụ',
              required: true,
              defaultValue: 'nhan_vien',
              options: [
                { label: 'Giám đốc', value: 'giam_doc' },
                { label: 'Phó Giám đốc', value: 'pho_giam_doc' },
                { label: 'Trưởng phòng/khoa', value: 'truong' },
                { label: 'Phó Trưởng phòng/khoa', value: 'pho_truong' },
                { label: 'Bác sĩ', value: 'bac_si' },
                { label: 'Y sĩ', value: 'y_si' },
                { label: 'Điều dưỡng', value: 'dieu_duong' },
                { label: 'Kỹ thuật viên', value: 'ky_thuat_vien' },
                { label: 'Dược sĩ', value: 'duoc_si' },
                { label: 'Cán bộ/Chuyên viên', value: 'can_bo' },
                { label: 'Nhân viên', value: 'nhan_vien' },
              ],
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'academicTitle',
              type: 'select',
              label: 'Học vị / Học hàm',
              options: [
                { label: 'Giáo sư (GS)', value: 'gs' },
                { label: 'Phó Giáo sư (PGS)', value: 'pgs' },
                { label: 'Tiến sĩ (TS)', value: 'ts' },
                { label: 'Thạc sĩ (ThS)', value: 'ths' },
                { label: 'Bác sĩ Chuyên khoa II (BSCKII)', value: 'bsckii' },
                { label: 'Bác sĩ Chuyên khoa I (BSCKI)', value: 'bscki' },
                { label: 'Bác sĩ (BS)', value: 'bs' },
                { label: 'Dược sĩ Đại học (DSĐH)', value: 'dsdh' },
                { label: 'Cử nhân (CN)', value: 'cn' },
                { label: 'Không có học vị', value: 'none' },
              ],
              admin: {
                width: '50%',
              },
            },
            {
              name: 'email',
              type: 'email',
              label: 'Email công vụ',
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          label: 'Ảnh chân dung',
        },
        {
          name: 'bio',
          type: 'textarea',
          label: 'Tiểu sử ngắn (không bắt buộc)',
        },
      ],
    },
  ],
};
