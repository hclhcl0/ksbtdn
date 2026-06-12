const { Client } = require('pg');

async function getHeader() {
  const client = new Client({ connectionString: 'postgresql://postgres:123456@127.0.0.1:5433/webcq' });
  await client.connect();

  try {
    const res = await client.query("SELECT * FROM header LIMIT 1");
    if (res.rows.length > 0) {
      console.log("HEADER ROW:", JSON.stringify(res.rows[0], null, 2));
      
      const menuRes = await client.query("SELECT * FROM header_menu_items WHERE _parent_id = $1 ORDER BY _order ASC", [res.rows[0].id]);
      console.log("MENU ITEMS:", JSON.stringify(menuRes.rows, null, 2));

      // Check sub items if any
      const subItemsRes = await client.query("SELECT * FROM header_menu_items_sub_items ORDER BY _order ASC");
      if (subItemsRes.rows.length > 0) {
         console.log("SUB ITEMS:", JSON.stringify(subItemsRes.rows, null, 2));
      }
    } else {
      console.log("No header found!");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

getHeader();
