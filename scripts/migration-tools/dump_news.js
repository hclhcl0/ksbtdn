const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('D:\\CDC\\webcq\\next-frontend\\ksbtdana6a10_home.sql');

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let currentTable = '';
let inTargetTable = false;
let outStream = fs.createWriteStream('D:\\CDC\\webcq\\next-frontend\\news_extracted.sql');

const targetTables = ['tms_vi_news_rows', 'tms_vi_news_detail'];

rl.on('line', (line) => {
  if (line.startsWith("INSERT INTO `")) {
     const match = line.match(/INSERT INTO `(.*?)`/);
     if (match) {
         currentTable = match[1];
         if (targetTables.includes(currentTable)) {
             inTargetTable = true;
         } else {
             inTargetTable = false;
         }
     }
  }
  
  if (inTargetTable) {
      outStream.write(line + '\n');
  }
});

rl.on('close', () => {
    console.log("Extraction to news_extracted.sql complete.");
    outStream.close();
});
