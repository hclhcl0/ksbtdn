
const { Client } = require('pg');

async function update() {
  const client = new Client({ connectionString: 'postgresql://postgres:123456@127.0.0.1:5433/webcq' });
  await client.connect();
  
  try {
    await client.query("BEGIN");
    let res = await client.query("SELECT id FROM main_menu LIMIT 1");
    if (res.rows.length === 0) {
       await client.query("INSERT INTO main_menu (id, menu_position) VALUES (1, 'below')");
       res = await client.query("SELECT id FROM main_menu LIMIT 1");
    }
    const headerId = res.rows[0].id;
    
    await client.query("DELETE FROM main_menu_menu_items_sub_items WHERE _parent_id IN (SELECT id FROM main_menu_menu_items WHERE _parent_id = $1)", [headerId]);
    await client.query("DELETE FROM main_menu_menu_items WHERE _parent_id = $1", [headerId]);
    
    const items = [{"label":"Trang chủ","url":"/","subItems":[]},{"label":"Giới thiệu","url":"/category/gioi-thieu/","subItems":[]},{"label":"Sức khỏe","url":"/category/van-de-suc-khoe/","subItems":[]},{"label":"Dịch vụ","url":"/category/hoat-dong-dich-vu/","subItems":[{"label":"Phòng khám 957","url":"/category/hoat-dong-dich-vu/phong-kham-957/"},{"label":"Thông báo","url":"/category/hoat-dong-dich-vu/thong-bao/"},{"label":"Thông tin","url":"/category/hoat-dong-dich-vu/thong-tin/"},{"label":"Giấy phép","url":"/category/hoat-dong-dich-vu/giay-phep/"},{"label":"Bảng giá","url":"/category/hoat-dong-dich-vu/bang-gia/"}]},{"label":"Đào tạo","url":"/category/dao-tao/","subItems":[{"label":"Kế hoạch","url":"/category/dao-tao/ke-hoach/"},{"label":"Thông báo chiêu sinh","url":"/category/dao-tao/thong-bao-chieu-sinh/"},{"label":"Hoạt động đào tạo","url":"/category/dao-tao/hoat-dong-dao-tao/"},{"label":"Quyết định cấp GCN","url":"/category/dao-tao/quyet-dinh-cap-gcn/"},{"label":"Văn bản","url":"/category/dao-tao/van-ban/"},{"label":"Đội ngũ giảng viên","url":"/category/dao-tao/doi-ngu-giang-vien/"},{"label":"Viện - Trường","url":"/category/dao-tao/vien--truong/"}]},{"label":"Công đoàn","url":"/category/hoat-dong-cong-doan/","subItems":[]},{"label":"Mua sắm","url":"/category/thong-tin-mua-sam/","subItems":[]},{"label":"Hành chính","url":"#","subItems":[{"label":"Thủ tục hành chính","url":"/category/thu-tuc-hanh-chinh/"},{"label":"Cải cách hành chính","url":"/category/cai-cach-hanh-chinh/"},{"label":"Phổ biến, giáo dục pháp luật","url":"/category/thong-tin/pho-bien-van-ban-phap-luat/"},{"label":"Hỏi - Đáp","url":"/hoidap/"}]},{"label":"Liên Hệ","url":"/lien-he.html","subItems":[]}];
    
    for (let i = 0; i < items.length; i++) {
      const idStr = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      await client.query(
        "INSERT INTO main_menu_menu_items (_order, _parent_id, id, label, url) VALUES ($1, $2, $3, $4, $5)",
        [i + 1, headerId, idStr, items[i].label, items[i].url]
      );
      
      for (let j = 0; j < items[i].subItems.length; j++) {
        const subIdStr = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        await client.query(
          "INSERT INTO main_menu_menu_items_sub_items (_order, _parent_id, id, label, url) VALUES ($1, $2, $3, $4, $5)",
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
