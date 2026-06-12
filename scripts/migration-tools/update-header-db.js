const { Client } = require('pg');

async function updateHeader() {
  const client = new Client({ connectionString: 'postgresql://postgres:123456@127.0.0.1:5433/webcq' });
  await client.connect();

  try {
    await client.query("BEGIN");

    // 1. Ensure header row exists
    let res = await client.query("SELECT id FROM header LIMIT 1");
    if (res.rows.length === 0) {
      await client.query("INSERT INTO header (id) VALUES (1)");
      res = await client.query("SELECT id FROM header LIMIT 1");
    }
    const headerId = res.rows[0].id;

    // 2. Update header table
    await client.query(`
      UPDATE header SET
        site_name = $1,
        logo_customization_logo_height = 52,
        logo_customization_logo_position = 'left',
        logo_customization_show_site_name = true,
        logo_customization_site_name_line1 = 'TRUNG TÂM KIỂM SOÁT BỆNH TẬT',
        logo_customization_site_name_line2 = 'THÀNH PHỐ ĐÀ NẴNG',
        logo_customization_mobile_logo_height = 40,
        logo_customization_logo_hover_effect = 'scale-tilt',
        logo_customization_mobile_show_site_name = false,
        search_customization_position = 'hotline',
        search_customization_style = 'inline',
        search_customization_width = 250,
        menu_position = 'right',
        hotline_phone = '0909 408 895',
        hotline_action_link = 'https://facebook.com/ksbthcm',
        hotline_position = 'below-nav',
        updated_at = NOW()
      WHERE id = $2
    `, ['Cổng thông tin điện tử', headerId]);

    // 3. Update header_menu_items
    // Clear existing
    await client.query("DELETE FROM header_menu_items WHERE _parent_id = $1", [headerId]);

    // Insert new
    const items = [
      { label: 'Trang chủ', url: '/' },
      { label: 'Giới thiệu', url: '/gioi-thieu' },
      { label: 'Tin tức & Sự kiện', url: '/tin-tuc-su-kien' },
      { label: 'Văn bản', url: '/van-ban' }
    ];

    for (let i = 0; i < items.length; i++) {
      // Create random 24 char hex string for object id
      const idStr = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      await client.query(`
        INSERT INTO header_menu_items (_order, _parent_id, id, label, url)
        VALUES ($1, $2, $3, $4, $5)
      `, [i + 1, headerId, idStr, items[i].label, items[i].url]);
    }

    await client.query("COMMIT");
    console.log("SUCCESS");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
  } finally {
    await client.end();
  }
}

updateHeader();
