const fs = require('fs');

const sql = fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\ksbtdana6a10_home.sql', 'utf8');

const startCat = sql.indexOf('INSERT INTO `tms_vi_news_cat`');
if (startCat !== -1) {
    const endCat = sql.indexOf(';', startCat);
    const catSql = sql.substring(startCat, endCat + 1);
    
    // Parse the values
    const valuesPart = catSql.substring(catSql.indexOf('VALUES') + 6).trim();
    const matches = valuesPart.match(/\((.*?)\)/g);
    
    const categories = [];
    if (matches) {
        for (const match of matches) {
            // Very naive split by comma, works if strings don't contain commas, 
            // but category names might. Let's use regex to extract strings.
            const strings = [];
            const strRegex = /'((?:[^'\\]|\\.)*)'/g;
            let m;
            while ((m = strRegex.exec(match)) !== null) {
                strings.push(m[1]);
            }
            // Usually schema is (catid, parentid, title, alias, ...)
            // Let's also extract numbers
            const nums = match.match(/\b\d+\b/g);
            if (nums && strings.length > 0) {
                categories.push({
                    catid: parseInt(nums[0]), // usually the first number is catid
                    title: strings[0], // usually the first string is the title
                    alias: strings[1] || '' // second string is usually the alias
                });
            }
        }
    }
    
    fs.writeFileSync('D:\\CDC\\webcq\\next-frontend\\categories.json', JSON.stringify(categories, null, 2));
    console.log(`Extracted ${categories.length} categories.`);
} else {
    console.log("Category table not found.");
}
