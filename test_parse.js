const fs = require('fs');

function parseSqlRow(rowStr) {
    const cols = [];
    let current = '';
    let inQuotes = false;
    let escapeNext = false;
    
    for (let i = 0; i < rowStr.length; i++) {
        let char = rowStr[i];
        if (escapeNext) {
            current += char;
            escapeNext = false;
            continue;
        }
        if (char === '\\') {
            // Keep the backslash if it's not escaping a quote, but for simple parsing let's just escape
            escapeNext = true;
            continue;
        }
        if (char === "'") {
            if (inQuotes && i + 1 < rowStr.length && rowStr[i+1] === "'") {
                current += "'";
                i++; 
                continue;
            }
            inQuotes = !inQuotes;
            continue;
        }
        if (char === ',' && !inQuotes) {
            cols.push(current.trim());
            current = '';
            continue;
        }
        current += char;
    }
    cols.push(current.trim());
    return cols;
}

const sql = fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\ksbtdana6a10_home.sql', 'utf8');
const rowsStart = sql.indexOf('INSERT INTO `tms_vi_news_rows` VALUES') + 'INSERT INTO `tms_vi_news_rows` VALUES'.length;
const detailsStart = sql.indexOf('INSERT INTO `tms_vi_news_detail` VALUES');
const rowsStr = sql.substring(rowsStart, detailsStart);

let rowTuples = rowsStr.split(/\),\s*\r?\n\(/);
let successCount = 0;
let failCount = 0;

for (let t of rowTuples.slice(0, 10)) {
    t = t.trim().replace(/^\(/, '').replace(/\)[;,]?$/, '');
    const cols = parseSqlRow(t);
    console.log(`ID: ${cols[0]}, Title: ${cols[14]}, Alias: ${cols[15]}`);
}
