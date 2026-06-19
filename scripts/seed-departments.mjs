import pg from 'pg';
const { Pool } = pg;

const dbUrl = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!dbUrl) { console.error('No DATABASE_URI'); process.exit(1); }

const pool = new Pool({ connectionString: dbUrl, ssl: false });

const departments = [
  { name: 'Ban giám đốc',                                  code: 'BGD',     type: 'ban',   order: 1 },
  { name: 'Phòng Tổ chức - Hành chính',                    code: 'P-TCHC',  type: 'phong', order: 2 },
  { name: 'Phòng Kế hoạch - Nghiệp vụ',                    code: 'P-KHNV',  type: 'phong', order: 3 },
  { name: 'Phòng Tài chính - Kế toán',                     code: 'P-TCKT',  type: 'phong', order: 4 },
  { name: 'Khoa Phòng chống bệnh truyền nhiễm',            code: 'K-PCBTN', type: 'khoa',  order: 5 },
  { name: 'Khoa phòng chống HIV/AIDS',                     code: 'K-HIV',   type: 'khoa',  order: 6 },
  { name: 'Khoa phòng, chống bệnh không lây nhiễm',        code: 'K-BKLN',  type: 'khoa',  order: 7 },
  { name: 'Khoa Dinh dưỡng',                               code: 'K-DD',    type: 'khoa',  order: 8 },
  { name: 'Khoa Sức khỏe môi trường - Y tế trường học',   code: 'K-SKMT',  type: 'khoa',  order: 9 },
  { name: 'Khoa Bệnh nghề nghiệp',                         code: 'K-BNN',   type: 'khoa',  order: 10 },
  { name: 'Khoa chăm sóc sức khỏe sinh sản',               code: 'K-SKSS',  type: 'khoa',  order: 11 },
  { name: 'Khoa Truyền thông, giáo dục sức khỏe',          code: 'K-TTGDSK',type: 'khoa',  order: 12 },
  { name: 'Khoa Ký sinh trùng - Côn trùng',                code: 'K-KST',   type: 'khoa',  order: 13 },
  { name: 'Khoa Kiểm dịch Y tế quốc tế',                  code: 'K-KDYT',  type: 'khoa',  order: 14 },
  { name: 'Khoa Dược - Vật tư Y tế',                      code: 'K-DVTYT', type: 'khoa',  order: 15 },
  { name: 'Khoa Xét nghiệm - CĐHA - TDCN',                code: 'K-XN',    type: 'khoa',  order: 16 },
  { name: 'Phòng khám đa khoa',                            code: 'P-PKDK',  type: 'phong', order: 17 },
];

const client = await pool.connect();
let ok = 0;

for (const d of departments) {
  try {
    await client.query(
      `INSERT INTO departments (name, code, type, sort_order, updated_at, created_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (code) DO UPDATE
         SET name = EXCLUDED.name,
             type = EXCLUDED.type,
             sort_order = EXCLUDED.sort_order`,
      [d.name, d.code, d.type, d.order]
    );
    ok++;
    console.log(`✓ ${d.name}`);
  } catch (e) {
    console.error(`✗ ${d.name}: ${e.message}`);
  }
}

client.release();
await pool.end();
console.log(`\nKết quả: ${ok}/${departments.length} phòng ban đã được tạo.`);
