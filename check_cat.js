const fs = require('fs');
const sql = fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\news_extracted.sql', 'utf8');
const start = sql.indexOf('INSERT INTO `tms_vi_news_cat`');
if (start === -1) {
    console.log("Not found");
} else {
    console.log(sql.substring(start, start + 1000));
}
