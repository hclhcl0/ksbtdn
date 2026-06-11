const pg = require('pg');
const { Pool } = pg;

const dbUrl = 'postgres://ffdfa8f13d7746bc1e29d1b170d8ed320749b57b70c12e5c139fbc4d741a09a6:sk_sL0r3ndYAN_S_xG4VNGWB@db.prisma.io:5432/postgres?sslmode=require';

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  console.log('📡 Connected to Production DB.');
  
  try {
    // 1. Check tables in schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\n📊 Tables in public schema:');
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(tables.join(', '));
    
    // Check specific tables
    const checkTables = ['video_channels', 'form_submissions', 'payload_locked_documents_rels', 'payload_preferences_rels', 'users', 'articles'];
    for (const t of checkTables) {
      console.log(`\n🔍 Checking table: ${t}`);
      if (tables.includes(t)) {
        console.log(`✅ Table "${t}" exists.`);
        const colsRes = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [t]);
        colsRes.rows.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type}`);
        });
      } else {
        console.log(`❌ Table "${t}" DOES NOT exist.`);
      }
    }
  } catch (err) {
    console.error('💥 Database query error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
