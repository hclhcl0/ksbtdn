const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('D:\\CDC\\webcq\\next-frontend\\ksbtdana6a10_home.sql');

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let newsRowsCount = 0;
let newsDetailCount = 0;

rl.on('line', (line) => {
  if (line.startsWith("INSERT INTO `tms_vi_news_rows`")) {
     newsRowsCount += (line.match(/\),\s*\(/g) || []).length + 1;
  }
  if (line.startsWith("INSERT INTO `tms_vi_news_detail`")) {
     newsDetailCount += (line.match(/\),\s*\(/g) || []).length + 1;
  }
});

rl.on('close', () => {
    console.log(`Found approximately ${newsRowsCount} news rows and ${newsDetailCount} news details.`);
});
