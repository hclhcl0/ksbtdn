import type { GlobalConfig } from 'payload';

export const BannerSettings: GlobalConfig = {
  slug: 'banner-settings',
  label: 'Cấu hình Banner',
  admin: {
    group: 'Cấu hình',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroSliderSize',
      type: 'select',
      label: 'Kích thước Slider Banner trang chủ',
      options: [
        { label: 'Nhỏ', value: 'small' },
        { label: 'Vừa', value: 'medium' },
        { label: 'Lớn', value: 'large' },
        { label: 'Tùy chỉnh', value: 'custom' },
      ],
      defaultValue: 'medium',
      admin: {
        description: 'Định dạng chiều cao áp dụng chung cho toàn bộ khối Slider Banner.',
      }
    },
    {
      name: 'heroSliderCustomHeight',
      type: 'number',
      label: 'Chiều cao tự gõ (px)',
      admin: {
        condition: (data) => data.heroSliderSize === 'custom',
        description: 'Nhập chiều cao bằng pixel (ví dụ: 500). Áp dụng chung cho toàn bộ Slider.',
      }
    },
    {
      name: 'heroSliderEffect',
      type: 'select',
      label: 'Hiệu ứng chuyển ảnh Banner',
      options: [
        { label: '🔄 Trượt ngang (Slide)', value: 'slide' },
        { label: '✨ Mờ dần (Fade)', value: 'fade' },
        { label: '🔳 Thu phóng (Zoom)', value: 'zoom' },
        { label: '📦 Lật (Flip)', value: 'flip' },
      ],
      defaultValue: 'slide',
      admin: {
        description: 'Chọn hiệu ứng hoạt hình khi chuyển từ ảnh này sang ảnh khác trong Slider.',
      }
    },
    {
      name: 'heroSliderAutoplayDelay',
      type: 'number',
      label: 'Thời gian dừng ở mỗi ảnh (mili-giây)',
      defaultValue: 5000,
      admin: {
        description: 'Nhập thời gian tính bằng mili-giây (1 giây = 1000). Mặc định là 5000 (5 giây).',
      }
    },
  ],
};
