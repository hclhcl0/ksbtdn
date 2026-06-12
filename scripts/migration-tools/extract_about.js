const fs = require('fs');
const readline = require('readline');

if (fs.existsSync('D:\\CDC\\webcq\\next-frontend\\extracted_about.sql')) {
    fs.unlinkSync('D:\\CDC\\webcq\\next-frontend\\extracted_about.sql');
}

const fileStream = fs.createReadStream('D:\\CDC\\webcq\\next-frontend\\ksbtdana6a10_home.sql');

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let inBlock = false;

rl.on('line', (line) => {
  if (line.startsWith("INSERT INTO `tms_vi_about`") || line.startsWith("INSERT INTO `tms_vi_page`")) {
    fs.appendFileSync('D:\\CDC\\webcq\\next-frontend\\extracted_about.sql', line + '\n');
    if (!line.endsWith(';')) {
        inBlock = true;
    }
  } else if (inBlock) {
    fs.appendFileSync('D:\\CDC\\webcq\\next-frontend\\extracted_about.sql', line + '\n');
    if (line.trim().endsWith(';')) {
        inBlock = false;
    }
  }
});

rl.on('close', () => {
    console.log("Extraction completed.");
});
