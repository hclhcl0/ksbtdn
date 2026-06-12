const fs = require('fs');
const sql = fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\news_extracted.sql', 'utf8');
const start = sql.indexOf('INSERT INTO `tms_vi_news_detail`');
console.log(sql.substring(start, start + 300));
