import pg from 'pg';

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
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URI });
  try {
    const parentRes = await pool.query("SELECT id FROM categories WHERE slug = 'suc-khoe'");
    if (parentRes.rowCount === 0) {
      console.log('Could not find parent category "suc-khoe"');
      process.exit(1);
    }
    const parentId = parentRes.rows[0].id;
    console.log(`Found parent ID: ${parentId}`);

    // Fetch highest ID
    const maxIdRes = await pool.query("SELECT MAX(id) as maxid FROM categories");
    let nextId = (maxIdRes.rows[0].maxid || 0) + 1;

    for (let i = 0; i < categoriesToCreate.length; i++) {
      const name = categoriesToCreate[i];
      const slug = generateSlug(name);
      
      const check = await pool.query("SELECT id FROM categories WHERE slug = $1", [slug]);
      if (check.rowCount > 0) {
        console.log(`Skipping ${name}, already exists`);
        continue;
      }

      await pool.query(
        "INSERT INTO categories (id, name, slug, parent_id, order_num, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())",
        [nextId++, name, slug, parentId, i + 1]
      );
      console.log(`Created: ${name} (slug: ${slug})`);
    }

    console.log('All categories created!');
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

run();
