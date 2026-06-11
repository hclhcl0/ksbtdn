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
    const res = await client.query(`
      SELECT
          tc.constraint_name,
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='payload_locked_documents_rels';
    `);
    
    console.log('\n🔗 Foreign Keys on payload_locked_documents_rels:');
    res.rows.forEach(row => {
      console.log(`   - Constraint: ${row.constraint_name} | Column: ${row.column_name} -> ${row.foreign_table_name}(${row.foreign_column_name})`);
    });
    
  } catch (err) {
    console.error('💥 Database query error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
