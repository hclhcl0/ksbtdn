import { getPayload } from 'payload';
import configPromise from '@payload-config';

const categories = [
  { name: 'Giới thiệu', slug: 'gioi-thieu' },
  { name: 'Sức khỏe', slug: 'suc-khoe' },
  { 
    name: 'Dịch vụ', slug: 'dich-vu',
    children: [
      { name: 'Phòng khám 957', slug: 'phong-kham-957' },
      { name: 'Thông báo', slug: 'thong-bao' },
      { name: 'Thông tin', slug: 'thong-tin' },
      { name: 'Giấy phép', slug: 'giay-phep' },
      { name: 'Bảng giá', slug: 'bang-gia' }
    ]
  },
  {
    name: 'Đào tạo', slug: 'dao-tao',
    children: [
      { name: 'Kế hoạch', slug: 'ke-hoach' },
      { name: 'Thông báo chiêu sinh', slug: 'thong-bao-chieu-sinh' },
      { name: 'Hoạt động đào tạo', slug: 'hoat-dong-dao-tao' },
      { name: 'Quyết định cấp GCN', slug: 'quyet-dinh-cap-gcn' },
      { name: 'Văn bản', slug: 'van-ban' },
      { name: 'Đội ngũ giảng viên', slug: 'doi-ngu-giang-vien' },
      { name: 'Viện - Trường', slug: 'vien-truong' }
    ]
  },
  { name: 'Công đoàn', slug: 'cong-doan' },
  { name: 'Mua sắm', slug: 'mua-sam' },
  {
    name: 'Hành chính', slug: 'hanh-chinh',
    children: [
      { name: 'Thủ tục hành chính', slug: 'thu-tuc-hanh-chinh' },
      { name: 'Cải cách hành chính', slug: 'cai-cach-hanh-chinh' },
      { name: 'Phổ biến, giáo dục pháp luật', slug: 'pho-bien-giao-duc-phap-luat' },
      { name: 'Hỏi - Đáp', slug: 'hoi-dap' }
    ]
  }
];

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    console.log("Creating categories...");

    const createdCategories = [];

    for (const cat of categories) {
      // Check if category exists
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: cat.slug } }
      });

      let parentRes;
      if (existing.docs.length > 0) {
        parentRes = existing.docs[0];
      } else {
        parentRes = await payload.create({
          collection: 'categories',
          data: { name: cat.name, slug: cat.slug }
        });
      }
      createdCategories.push(parentRes);

      if (cat.children) {
        for (const child of cat.children) {
          const existingChild = await payload.find({
            collection: 'categories',
            where: { slug: { equals: child.slug } }
          });
          let childRes;
          if (existingChild.docs.length === 0) {
            childRes = await payload.create({
              collection: 'categories',
              data: {
                name: child.name,
                slug: child.slug,
                parent: parentRes.id,
              }
            });
          } else {
            childRes = existingChild.docs[0];
          }
          createdCategories.push(childRes);
        }
      }
    }

    console.log("Moving existing articles to new categories...");
    const articles = await payload.find({
      collection: 'articles',
      limit: 1000,
    });

    let catIndex = 0;
    for (const article of articles.docs) {
      const randomCat = createdCategories[catIndex % createdCategories.length];
      await payload.update({
        collection: 'articles',
        id: article.id,
        data: {
          category: randomCat.id,
        }
      });
      catIndex++;
    }

    console.log("Configuring homepage settings...");
    const homeCats = createdCategories.filter(c => ['Sức khỏe', 'Dịch vụ', 'Đào tạo', 'Hành chính'].includes(c.name));
    
    await payload.updateGlobal({
      slug: 'settings',
      data: {
        homeNewsLimit: 8,
        homeNewsColumnsDesktop: 4,
        homeNewsColumnsMobile: 1,
        homeCategories: homeCats.map(c => ({
          category: c.id,
          limit: 8
        }))
      }
    });

    console.log("Configuring main menu...");
    // Map the created categories into the menuItems format
    const menuItems = categories.map(cat => {
      const parentCat = createdCategories.find(c => c.slug === cat.slug);
      const menuItem: any = {
        label: cat.name,
        type: 'reference',
        reference: {
          relationTo: 'categories',
          value: parentCat.id
        }
      };

      if (cat.children && cat.children.length > 0) {
        menuItem.subMenu = cat.children.map(child => {
          const childCat = createdCategories.find(c => c.slug === child.slug);
          return {
            label: child.name,
            type: 'reference',
            reference: {
              relationTo: 'categories',
              value: childCat.id
            }
          };
        });
      }

      return menuItem;
    });

    // Add Home at the beginning
    menuItems.unshift({
      label: 'Home',
      type: 'custom',
      url: '/'
    });

    await payload.updateGlobal({
      slug: 'main-menu',
      data: {
        menuItems: menuItems
      }
    });

    return new Response('Categories seeded, settings and menu updated!', { status: 200 });
  } catch (error: any) {
    console.error("Error seeding categories:", error);
    return new Response(error.message, { status: 500 });
  }
}
