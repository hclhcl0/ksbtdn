import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';

const categoriesToCreate = [
  "Tay chân miệng",
  "Sốt xuất huyết - Chikungunya",
  "Khám sức khỏe định kỳ cho người dân năm 2026",
  "Biến đổi khí hậu và Sức khỏe cộng đồng",
  "Bệnh cúm",
  "Bệnh cúm gia cầm",
  "Bệnh hô hấp",
  "Bệnh lao",
  "Bệnh phổi tắc nghẽn mạn tính",
  "Bệnh Sởi",
  "Bệnh Dại",
  "Đau mắt đỏ",
  "Đậu mùa khỉ",
  "Ho gà",
  "Marburg",
  "HIV/AIDS",
  "Phòng, chống tác hại thuốc lá",
  "Đột quỵ",
  "Tim mạch",
  "Đái tháo đường",
  "Cong vẹo cột sống",
  "Dinh dưỡng",
  "Y tế trường học",
  "Người cao tuổi",
  "Chăm sóc trẻ em",
  "Sức khỏe sinh sản",
  "Nuôi con bằng sữa mẹ",
  "Sức khoẻ người lao động",
  "Tiêm chủng",
  "Tiêm chủng nhập học",
  "Chương trình tiêm chủng mở rộng"
];

function generateSlug(text) {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  try {
    const payload = await getPayload({ config: configPromise });
    console.log('Connected to Payload');
    
    // Find parent category "Sức khỏe"
    const { docs: rootCats } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'suc-khoe' } }
    });

    if (rootCats.length === 0) {
      console.log('Could not find root category "Sức khỏe" (slug: suc-khoe)');
      process.exit(1);
    }
    
    const parentId = rootCats[0].id;
    console.log(`Found parent category "Sức khỏe" with ID: ${parentId}`);

    // Fetch existing categories to avoid duplicates
    const { docs: existingCats } = await payload.find({
      collection: 'categories',
      where: { parent: { equals: parentId } },
      limit: 100
    });
    const existingNames = existingCats.map(c => c.name.toLowerCase());

    for (let i = 0; i < categoriesToCreate.length; i++) {
      const name = categoriesToCreate[i];
      if (existingNames.includes(name.toLowerCase())) {
        console.log(`Skipping "${name}", already exists.`);
        continue;
      }
      
      const slug = generateSlug(name);
      
      try {
        await payload.create({
          collection: 'categories',
          data: {
            name: name,
            slug: slug,
            parent: parentId,
            orderNum: i + 1
          }
        });
        console.log(`Created: ${name} (slug: ${slug})`);
      } catch (e) {
        console.error(`Failed to create ${name}: ${e.message}`);
      }
    }

    console.log('Done creating categories!');
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

run();
