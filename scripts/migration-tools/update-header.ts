import { getPayload } from 'payload';
import configPromise from './src/payload.config.ts';

async function updateHeader() {
  const payload = await getPayload({ config: configPromise });
  await payload.updateGlobal({
    slug: 'header',
    data: {
      siteName: 'Cổng thông tin điện tử',
      logoCustomization: {
        logoHeight: 52,
        logoPosition: 'left',
        showSiteName: true,
        siteNameLine1: 'TRUNG TÂM KIỂM SOÁT BỆNH TẬT',
        siteNameLine2: 'THÀNH PHỐ ĐÀ NẴNG',
        mobileLogoHeight: 40,
        logoHoverEffect: 'scale-tilt',
        mobileShowSiteName: false
      },
      searchCustomization: {
        position: 'hotline',
        style: 'inline',
        width: 250
      },
      menuPosition: 'right',
      hotline: {
        phone: '0909 408 895',
        actionLink: 'https://facebook.com/ksbthcm',
        position: 'below-nav'
      },
      socialLinks: {
        facebook: '',
        youtube: '',
        twitter: '',
        instagram: ''
      },
      menuItems: [
        { label: 'Trang chủ', url: '/' },
        { label: 'Giới thiệu', url: '/gioi-thieu' },
        { label: 'Tin tức & Sự kiện', url: '/tin-tuc-su-kien' },
        { label: 'Văn bản', url: '/van-ban' }
      ]
    }
  });
  console.log('Header updated successfully!');
  process.exit(0);
}

updateHeader();
