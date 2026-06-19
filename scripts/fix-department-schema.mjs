import pg from 'pg';
const { Pool } = pg;

const dbUrl = process.env.DATABASE_URI || process.env.DATABASE_URL;
const pool = new Pool({ connectionString: dbUrl, ssl: false });
const client = await pool.connect();

const ops = [
  // zalo_followers: xóa cột text cũ, thêm FK mới
  `ALTER TABLE zalo_followers DROP COLUMN IF EXISTS department`,
  `ALTER TABLE zalo_followers ADD COLUMN IF NOT EXISTS department_id integer REFERENCES departments(id) ON DELETE SET NULL`,

  // zalo_staff_links: xóa cột text cũ, thêm FK mới
  `ALTER TABLE zalo_staff_links DROP COLUMN IF EXISTS department`,
  `ALTER TABLE zalo_staff_links ADD COLUMN IF NOT EXISTS department_id integer REFERENCES departments(id) ON DELETE SET NULL`,

  // ai_knowledge: xóa cột text cũ, thêm bảng rels (many)
  `ALTER TABLE ai_knowledge DROP COLUMN IF EXISTS allowed_department`,
];

for (const sql of ops) {
  try {
    await client.query(sql);
    console.log(`✓ ${sql.substring(0, 70)}`);
  } catch (e) {
    console.log(`⚠ ${e.message.substring(0, 80)}`);
  }
}

// ai_knowledge_rels for allowedDepartment (hasMany)
try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ai_knowledge_rels (
      id serial PRIMARY KEY,
      "order" integer,
      parent_id integer NOT NULL REFERENCES ai_knowledge(id) ON DELETE CASCADE,
      path varchar NOT NULL,
      departments_id integer REFERENCES departments(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ Created ai_knowledge_rels table');
  await client.query(`CREATE INDEX IF NOT EXISTS ai_knowledge_rels_parent_idx ON ai_knowledge_rels(parent_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS ai_knowledge_rels_path_idx ON ai_knowledge_rels(path)`);
  console.log('✓ Created ai_knowledge_rels indexes');
} catch (e) {
  console.log(`⚠ ai_knowledge_rels: ${e.message}`);
}

client.release();
await pool.end();
console.log('\n✅ Hoàn tất xử lý schema thủ công.');
