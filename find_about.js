const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('D:\\CDC\\webcq\\next-frontend\\ksbtdana6a10_home.sql');

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let aboutFound = false;
let pageFound = false;

rl.on('line', (line) => {
  if (line.startsWith('INSERT INTO `tms_about`')) {
    console.log("Found tms_about:");
    console.log(line.substring(0, 800));
    aboutFound = true;
  }
  if (line.startsWith('INSERT INTO `tms_page_rows`') || line.startsWith('INSERT INTO `tms_page`')) {
      if (line.toLowerCase().includes('i-thieu')) {
        console.log("Found tms_page with 'Giới thiệu':");
        console.log(line.substring(0, 800));
        pageFound = true;
      }
  }
});

rl.on('close', () => {
    if (!aboutFound) console.log("No tms_about found.");
    if (!pageFound) console.log("No tms_page with about found.");
});
