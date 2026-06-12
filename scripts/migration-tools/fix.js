const fs = require('fs');
let str = fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\src\\app\\(frontend)\\api\\migrate-master\\route.ts', 'utf8');
str = str.replace(/^\"/, '').replace(/\"$/, '');
str = str.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '\"').replace(/\\\\/g, '\\');
fs.writeFileSync('D:\\CDC\\webcq\\next-frontend\\src\\app\\(frontend)\\api\\migrate-master\\route.ts', str);
console.log('Fixed');
