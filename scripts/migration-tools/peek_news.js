const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('D:\\CDC\\webcq\\next-frontend\\ksbtdana6a10_home.sql');

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let inNewsRows = false;
let count = 0;

rl.on('line', (line) => {
  if (line.startsWith("INSERT INTO `tms_vi_news_rows`")) {
    inNewsRows = true;
  } else if (inNewsRows) {
    if (count < 5) {
        console.log(line.substring(0, 300));
        count++;
    }
    if (line.trim().endsWith(';')) {
        inNewsRows = false;
    }
  }
});
