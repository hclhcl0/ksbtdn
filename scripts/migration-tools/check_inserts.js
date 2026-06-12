const fs = require('fs');
const sql = fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\news_extracted.sql', 'utf8');
console.log('rows_inserts:', (sql.match(/INSERT INTO `tms_vi_news_rows`/g) || []).length);
console.log('details_inserts:', (sql.match(/INSERT INTO `tms_vi_news_detail`/g) || []).length);
