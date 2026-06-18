import type { CollectionConfig } from 'payload';

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: 'Dịch vụ - Sản phẩm',
    plural: 'Dịch vụ - Sản phẩm',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', 'status'],
    group: 'Dịch vụ sản phẩm',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tên Dịch vụ / Sản phẩm',
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (URL)',
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.title && !data.slug) {
              const slugify = (str: string) =>
                str
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[đĐ]/g, 'd')
                  .replace(/([^a-z0-9\s])/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-+|-+$/g, '');
              return slugify(data.title);
            }
          },
        ],
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'serviceCategories',
      label: 'Danh mục',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái',
      defaultValue: 'active',
      options: [
        { label: 'Đang cung cấp', value: 'active' },
        { label: 'Tạm ngưng', value: 'inactive' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'price',
      type: 'text',
      label: 'Giá niêm yết',
      admin: {
        placeholder: 'VD: 150.000 VNĐ / Theo chỉ định',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Mô tả ngắn',
      admin: {
        description: 'Hiển thị ở trang danh sách bên ngoài (tối đa 2-3 câu)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Nội dung chi tiết',
      admin: {
        description: 'Thông tin đầy đủ về dịch vụ, đối tượng, quy trình...',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh đại diện (Thumbnail)',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'bookingUrl',
      type: 'text',
      label: 'Link Đăng ký / Mua',
      admin: {
        placeholder: 'VD: https://booking.hcdc.vn/dich-vu...',
        description: 'Đường dẫn đến hệ thống đặt lịch hoặc mua hàng (nếu có)',
      },
    },
    {
      name: 'contactPhone',
      type: 'text',
      label: 'SĐT Liên hệ tư vấn',
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
