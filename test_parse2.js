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
let rowsStr = sql.substring(rowsStart, detailsStart);

// Remove any subsequent "INSERT INTO `tms_vi_news_rows` VALUES"
rowsStr = rowsStr.replace(/;\s*INSERT INTO `tms_vi_news_rows` VALUES\s*/g, ',\n');

let rowTuples = rowsStr.split(/\),\s*\r?\n\(/);
for (let i=0; i<10; i++) {
    let t = rowTuples[i];
    t = t.trim().replace(/^\(/, '').replace(/\)[;,]?$/, '');
    const cols = parseSqlRow(t);
    console.log(`ID: ${cols[0]}, Title: ${cols[14]}, Alias: ${cols[15]}`);
}
