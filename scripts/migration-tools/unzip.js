const fs = require('fs');
const zlib = require('zlib');

const inputFile = 'C:\\Users\\SingPC\\Downloads\\ksbtdana6a10_home.sql.gz';
const outputFile = 'D:\\CDC\\webcq\\next-frontend\\ksbtdana6a10_home.sql';

const readStream = fs.createReadStream(inputFile);
const writeStream = fs.createWriteStream(outputFile);
const unzip = zlib.createGunzip();

readStream.pipe(unzip).pipe(writeStream);

writeStream.on('finish', () => {
    console.log('Decompression complete.');
});
readStream.on('error', (err) => {
    console.error('Error reading file:', err);
});
writeStream.on('error', (err) => {
    console.error('Error writing file:', err);
});
