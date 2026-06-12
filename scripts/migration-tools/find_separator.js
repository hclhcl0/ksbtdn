const fs = require('fs');
const sql = fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\news_extracted.sql', 'utf8');

const match = sql.match(/INSERT INTO `tms_vi_news_rows` VALUES\s*(.*?);/s);
if (match) {
    const values = match[1];
    const endMatch = values.match(/\d+,\s*\d+\)(.*?)\(\d+,/);
    if (endMatch) {
        console.log("Separator found:", JSON.stringify(endMatch[1]));
    } else {
        console.log("No separator matched.");
    }
} else {
    console.log("No VALUES match.");
}
