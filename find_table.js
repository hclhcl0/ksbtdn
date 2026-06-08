const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('D:\\CDC\\webcq\\next-frontend\\ksbtdana6a10_home.sql');

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let currentInsertTable = '';
let foundTables = new Set();

rl.on('line', (line) => {
  if (line.startsWith("INSERT INTO `")) {
     const match = line.match(/INSERT INTO `(.*?)`/);
     if (match) currentInsertTable = match[1];
  }
  
  if (line.includes('Giới thiệu') || line.includes('Vị trí, chức năng') || line.includes('Trung tâm Kiểm soát bệnh tật')) {
     if (currentInsertTable && !line.startsWith("INSERT INTO `")) {
        foundTables.add(currentInsertTable);
     }
  }
});

rl.on('close', () => {
    console.log("Found keywords in tables:", Array.from(foundTables).join(', '));
});
