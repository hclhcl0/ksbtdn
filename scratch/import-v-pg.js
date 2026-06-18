import { Client } from 'pg';
import fs from 'fs';

async function importData() {
  const data = JSON.parse(fs.readFileSync('scratch/export-test-20-v.json', 'utf8'));

  const client = new Client({
    connectionString: 'postgres://postgres:E5nLuJvHdlKN68ni7UegmFWkvwq0d0mLdpuC8kCrWcQjHcTo7Ch7QMHcbGwa3AVd@127.0.0.1:65432/postgres'
  });
  await client.connect();

  async function insertTable(tableName, rows) {
    if (!rows || rows.length === 0) return;
    console.log(`Inserting ${rows.length} rows into ${tableName}...`);
    
    const colsRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [tableName]);
    const pgCols = colsRes.rows.map(r => r.column_name);

    for (const row of rows) {
      const keys = Object.keys(row).filter(k => pgCols.includes(k));
      const values = [];
      const placeholders = [];
      
      let idx = 1;
      for (const k of keys) {
        let val = row[k];
        
        const colDef = colsRes.rows.find(r => r.column_name === k);
        if (colDef.data_type === 'jsonb' && typeof val === 'string') {
          try {
            val = JSON.parse(val);
          } catch (e) {}
        }
        
        if (colDef.data_type === 'boolean' && typeof val === 'number') {
          val = val === 1;
        }

        values.push(val);
        placeholders.push(`$${idx++}`);
      }

      const query = `
        INSERT INTO ${tableName} (${keys.map(k => `"${k}"`).join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT (id) DO UPDATE SET
        ${keys.map((k, i) => `"${k}" = EXCLUDED."${k}"`).join(', ')}
      `;

      try {
        await client.query(query, values);
      } catch (err) {
        console.error(`Error inserting into ${tableName} id ${row.id}:`, err.message);
      }
    }
  }

  await insertTable('_articles_v', data._articles_v);
  await insertTable('_articles_v_rels', data._articles_v_rels);
  await insertTable('articles_rels', data.articles_rels);

  console.log('Versions Import completed!');
  await client.end();
}

importData().catch(console.error);
