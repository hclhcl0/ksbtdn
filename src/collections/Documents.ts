import type { CollectionConfig } from 'payload';

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: {
    singular: 'Văn bản',
    plural: 'Văn bản chỉ đạo',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['documentNumber', 'title', 'issuer', 'publishedDate'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'documentNumber',
      type: 'text',
      required: true,
      label: 'Số hiệu văn bản',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Trích yếu (Tên văn bản)',
    },
    {
      name: 'issuer',
      type: 'text',
      required: true,
      label: 'Cơ quan ban hành',
      defaultValue: 'Sở Y tế / HCDC',
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      label: 'Ngày ban hành',
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'File đính kèm (PDF/DOCX)',
    },
    {
      name: 'documentType',
      type: 'select',
      options: [
        { label: 'Chỉ thị', value: 'chi-thi' },
        { label: 'Quyết định', value: 'quyet-dinh' },
        { label: 'Nghị định', value: 'nghi-dinh' },
        { label: 'Công văn', value: 'cong-van' },
        { label: 'Thông báo', value: 'thong-bao' },
        { label: 'Khác', value: 'khac' },
      ],
      label: 'Loại văn bản',
    },
  ],
};
