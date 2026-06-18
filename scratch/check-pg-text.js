import { Client } from 'pg';

async function check() {
  const client = new Client({
    connectionString: 'postgres://postgres:E5nLuJvHdlKN68ni7UegmFWkvwq0d0mLdpuC8kCrWcQjHcTo7Ch7QMHcbGwa3AVd@127.0.0.1:65432/postgres'
  });
  await client.connect();
  const res = await client.query(`SELECT version_content FROM _articles_v WHERE version_content::text LIKE '%13 hành vi%' LIMIT 1`);
  const content = res.rows[0].version_content;
  
  function findText(node) {
    if (typeof node === 'object' && node !== null) {
      if (node.type === 'text' && node.text.includes('13 hành vi')) {
        const text = node.text;
        console.log("Found text:");
        for(let i=0; i<text.length; i++) {
          if (i > 0 && i < 150) {
            process.stdout.write(`Char ${i}: '${text[i]}' (U+${text.charCodeAt(i).toString(16).padStart(4, '0')})\n`);
          }
        }
        return true;
      }
      for (const key in node) {
        if (findText(node[key])) return true;
      }
    } else if (Array.isArray(node)) {
      for (const item of node) {
        if (findText(item)) return true;
      }
    }
    return false;
  }
  
  findText(content);
  await client.end();
}

check().catch(console.error);
