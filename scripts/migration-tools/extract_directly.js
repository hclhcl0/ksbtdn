const fs = require('fs');

console.log("Loading SQL file into memory...");
const sql = fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\ksbtdana6a10_home.sql', 'utf8');

function extractTable(tableName) {
    const insertStr = `INSERT INTO \`${tableName}\` VALUES`;
    let startIdx = sql.indexOf(insertStr);
    if (startIdx === -1) {
        startIdx = sql.indexOf(`INSERT INTO \`${tableName}\``);
        if (startIdx === -1) return '';
    }
    
    let nextInsertIdx = sql.indexOf('INSERT INTO `', startIdx + 10);
    let endIdx = nextInsertIdx !== -1 ? nextInsertIdx : sql.length;
    
    let unlockIdx = sql.indexOf('UNLOCK TABLES;', startIdx);
    if (unlockIdx !== -1 && unlockIdx < endIdx) {
        endIdx = unlockIdx;
    }
    
    return sql.substring(startIdx, endIdx);
}

console.log("Extracting tables...");
const rowsStr = extractTable('tms_vi_news_rows');
const detailsStr = extractTable('tms_vi_news_detail');

fs.writeFileSync('D:\\CDC\\webcq\\next-frontend\\news_extracted.sql', rowsStr + '\n' + detailsStr);
console.log(`Extracted rows length: ${rowsStr.length}, details length: ${detailsStr.length}`);
