import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';

async function seed() {
  console.log('Starting seed...');
  const payload = await getPayload({
    config: configPromise,
  });

  // Seed Users
  console.log('Seeding admin user...');
  try {
    const admin = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@ksbt.vnos.org',
        password: 'password123',
        name: 'Admin Test',
        role: 'admin',
      },
    });
    console.log('Created Admin:', admin.email);
  } catch (e) {
    console.log('Admin probably exists, skipping...', e.message);
  }

  // Seed Categories
  console.log('Seeding categories...');
  try {
    await payload.create({
      collection: 'categories',
      data: {
        name: 'Tin tức & Sự kiện',
        slug: 'tin-tuc-su-kien',
        description: 'Chuyên mục tin tức chung',
      }
    });
    
    await payload.create({
      collection: 'categories',
      data: {
        name: 'Y tế & Sức khỏe',
        slug: 'y-te-suc-khoe',
        description: 'Chuyên mục Y tế',
      }
    });
    console.log('Created categories');
  } catch(e) {
    console.log('Categories exist, skipping...', e.message);
  }

  // Seed Header (Global)
  console.log('Seeding Header...');
  await payload.updateGlobal({
    slug: 'header',
    data: {
      site_name: 'Trung Tâm Kiểm Soát Bệnh Tật Đà Nẵng',
      navItems: [
        {
          label: 'Trang chủ',
          url: '/',
          newTab: false,
        },
        {
          label: 'Tin tức',
          url: '/tin-tuc',
          newTab: false,
        },
        {
          label: 'Giới thiệu',
          url: '/gioi-thieu',
          newTab: false,
        }
      ]
    }
  });

  // Seed Settings (Global)
  console.log('Seeding Settings...');
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      themeConfig: {
        primaryColor: '#007a8c',
        primaryDarkColor: '#005a68',
        secondaryColor: '#4999d6',
        fontFamily: 'Inter'
      }
    }
  });

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch(console.error);
