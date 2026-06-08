const fs = require('fs');

const sql = fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\news_extracted.sql', 'utf8');
const rowsStart = sql.indexOf('INSERT INTO `tms_vi_news_rows` VALUES') + 'INSERT INTO `tms_vi_news_rows` VALUES'.length;
const detailsStart = sql.indexOf('INSERT INTO `tms_vi_news_detail` VALUES');

const rowsStr = sql.substring(rowsStart, detailsStart);

let strTuples = rowsStr.split(/\),\s*\r?\n\(/);
const idToCatMap = {};

for (let t of strTuples) {
    t = t.trim().replace(/^\(/, '').replace(/\)[;,]?$/, '');
    
    // t is like: 1, 2, 'listcatid', topicid, ...
    // we just need the first two numbers
    const parts = t.split(',');
    if (parts.length > 1) {
        const id = parseInt(parts[0].trim());
        const catid = parseInt(parts[1].trim());
        if (!isNaN(id) && !isNaN(catid)) {
            idToCatMap[id] = catid;
        }
    }
}

// Update news_data.json
const dataPath = 'D:\\CDC\\webcq\\next-frontend\\news_data.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

for (let article of data) {
    if (idToCatMap[article.id]) {
        article.catid = idToCatMap[article.id];
    }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log("Updated news_data.json with catids.");
