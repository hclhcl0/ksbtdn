const fs = require('fs');
const sql = fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\ksbtdana6a10_home.sql', 'utf8');
const rowsStart = sql.indexOf('INSERT INTO `tms_vi_news_rows` VALUES') + 'INSERT INTO `tms_vi_news_rows` VALUES'.length;
const detailsStart = sql.indexOf('INSERT INTO `tms_vi_news_detail` VALUES');
let rowsStr = sql.substring(rowsStart, detailsStart);

console.log("START:", rowsStr.substring(0, 200));
console.log("-------------------");
console.log("END:", rowsStr.substring(rowsStr.length - 200));
