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

const rowsStartStr = 'INSERT INTO `tms_vi_news_rows` VALUES';
const rowsStart = sql.indexOf(rowsStartStr);
const rowsEnd = sql.indexOf(';\n', rowsStart);
const rowsStr = sql.substring(rowsStart + rowsStartStr.length, rowsEnd);

let rowTuples = rowsStr.split(/\),\s*\r?\n\(/);
for (let i=0; i<3; i++) {
    let t = rowTuples[i];
    t = t.trim().replace(/^\(/, '').replace(/\)[;,]?$/, '');
    const cols = parseSqlRow(t);
    console.log(`ID: ${cols[0]}`);
    console.log(`publtime: ${cols[11]}`);
    console.log(`Title: ${cols[14]}`);
    console.log(`Alias: ${cols[15]}`);
    console.log(`Image: ${cols[17]}`);
    console.log('---');
}
