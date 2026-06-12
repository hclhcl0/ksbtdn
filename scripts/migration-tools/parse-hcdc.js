const fs = require('fs');

const html = fs.readFileSync('hcdc.html', 'utf8');
const navIndex = html.indexOf('class="sidenav__menu"');
if (navIndex === -1) process.exit(1);

const endIndex = html.indexOf('</nav>', navIndex);
const menuHtml = html.substring(navIndex, endIndex);

const items = [];

// Split by top level list items
const listItems = menuHtml.split(/<li class="[^"]*sidenav__menu-link--blue[^"]*">/);

for (let i = 1; i < listItems.length; i++) {
  const block = listItems[i];
  
  // Get top level link
  const aRegex = /<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/;
  const aMatch = aRegex.exec(block);
  if (!aMatch) continue;
  
  const url = aMatch[1];
  const label = aMatch[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  
  const subItems = [];
  
  // Check for dropdown
  const dropIndex = block.indexOf('class="sidenav__menu-dropdown');
  if (dropIndex !== -1) {
    const endDrop = block.indexOf('</ul>', dropIndex);
    if (endDrop !== -1) {
      const dropHtml = block.substring(dropIndex, endDrop);
      const subRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
      let subMatch;
      while ((subMatch = subRegex.exec(dropHtml)) !== null) {
         const subUrl = subMatch[1];
         const subLabel = subMatch[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
         subItems.push({ label: subLabel, url: subUrl });
      }
    }
  }
  
  if (label && label !== 'HCDC') {
    items.push({ label, url, subItems });
  }
}

console.log(JSON.stringify(items, null, 2));

// Generate SQL
let sql = `
const { Client } = require('pg');

async function update() {
  const client = new Client({ connectionString: 'postgresql://postgres:123456@127.0.0.1:5433/webcq' });
  await client.connect();
  
  try {
    await client.query("BEGIN");
    const res = await client.query("SELECT id FROM header LIMIT 1");
    if (res.rows.length === 0) throw new Error("No header");
    const headerId = res.rows[0].id;
    
    await client.query("DELETE FROM header_menu_items_sub_items WHERE _parent_id IN (SELECT id FROM header_menu_items WHERE _parent_id = $1)", [headerId]);
    await client.query("DELETE FROM header_menu_items WHERE _parent_id = $1", [headerId]);
    
    const items = ${JSON.stringify(items)};
    
    for (let i = 0; i < items.length; i++) {
      const idStr = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      await client.query(
        "INSERT INTO header_menu_items (_order, _parent_id, id, label, url) VALUES ($1, $2, $3, $4, $5)",
        [i + 1, headerId, idStr, items[i].label, items[i].url]
      );
      
      for (let j = 0; j < items[i].subItems.length; j++) {
        const subIdStr = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        await client.query(
          "INSERT INTO header_menu_items_sub_items (_order, _parent_id, id, label, url) VALUES ($1, $2, $3, $4, $5)",
          [j + 1, idStr, subIdStr, items[i].subItems[j].label, items[i].subItems[j].url]
        );
      }
    }
    
    await client.query("COMMIT");
    console.log("SUCCESS");
  } catch(e) {
    await client.query("ROLLBACK");
    console.error(e);
  } finally {
    await client.end();
  }
}
update();
`;

fs.writeFileSync('update-hcdc-menu.js', sql);
