import type { CollectionConfig } from 'payload';

export const WorkSchedules: CollectionConfig = {
  slug: 'work-schedules',
  labels: {
    singular: 'Lịch công tác',
    plural: 'Lịch công tác',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'location', 'status'],
    group: 'Nội dung',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Nội dung/Tiêu đề',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Thời gian bắt đầu',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Địa điểm',
    },
    {
      name: 'chairperson',
      type: 'text',
      label: 'Người chủ trì',
    },
    {
      name: 'participants',
      type: 'textarea',
      label: 'Thành phần tham dự',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Nội dung chi tiết/Ghi chú',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái',
      defaultValue: 'upcoming',
      options: [
        { label: 'Sắp diễn ra', value: 'upcoming' },
        { label: 'Đang diễn ra', value: 'ongoing' },
        { label: 'Đã hoàn thành', value: 'completed' },
        { label: 'Hủy', value: 'cancelled' },
      ],
    },
  ],
};
