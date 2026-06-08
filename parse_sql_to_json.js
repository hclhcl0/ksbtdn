const fs = require('fs');

async function extract() {
    const sql = fs.readFileSync('D:\\CDC\\webcq\\next-frontend\\news_extracted.sql', 'utf8');

    const rowsStart = sql.indexOf('INSERT INTO `tms_vi_news_rows` VALUES') + 'INSERT INTO `tms_vi_news_rows` VALUES'.length;
    const detailsStart = sql.indexOf('INSERT INTO `tms_vi_news_detail` VALUES');
    
    if (rowsStart === -1 || detailsStart === -1) {
        console.error("Could not find table starts");
        return;
    }

    const rowsStr = sql.substring(rowsStart, detailsStart);
    const detailsStr = sql.substring(detailsStart + 'INSERT INTO `tms_vi_news_detail` VALUES'.length);

    function extractTuples(str) {
        const tuples = [];
        let strTuples = str.split(/\),\s*\r?\n\(/);
        for (let t of strTuples) {
            t = t.trim().replace(/^\(/, '').replace(/\)[;,]?$/, '');
            const commaIdx = t.indexOf(',');
            if (commaIdx > 0) {
                const id = parseInt(t.substring(0, commaIdx).trim());
                if (!isNaN(id)) {
                    tuples.push({ id, content: t });
                }
            }
        }
        return tuples;
    }

    const rows = extractTuples(rowsStr);
    const details = extractTuples(detailsStr);

    console.log(`Found ${rows.length} rows and ${details.length} details.`);

    rows.sort((a, b) => a.id - b.id);
    const latestRows = rows.slice(-200);

    const detailMap = new Map();
    for (let d of details) {
        detailMap.set(d.id, d.content);
    }

    const finalData = [];
    for (let row of latestRows) {
        const strings = [];
        const strRegex = /'((?:[^'\\]|\\.)*)'/g;
        let sMatch;
        while ((sMatch = strRegex.exec(row.content)) !== null) {
            strings.push(sMatch[1].replace(/\\'/g, "'"));
        }
        
        // In news_rows: (id, catid, 'listcatid', topicid, admin_id, 'author', inhome, addtime, edittime, status, publtime, exptime, archive, hitstotal, hitscm, 'title', 'alias', 'hometext', 'image', ...)
        if (strings.length >= 6) {
            let title = strings[2] || '';
            let alias = strings[3] || '';
            let hometext = strings[4] || '';
            let image = strings[5] || '';
            
            let detailContent = detailMap.get(row.id) || "''";
            let bodyhtml = "";
            
            const detailStrings = [];
            const detailStrRegex = /'((?:[^'\\]|\\.)*)'/g;
            let detailMatch;
            while ((detailMatch = detailStrRegex.exec(detailContent)) !== null) {
                detailStrings.push(detailMatch[1].replace(/\\'/g, "'").replace(/\\n/g, "\n"));
            }
            
            if (detailStrings.length > 0) {
                bodyhtml = detailStrings.reduce((a, b) => a.length > b.length ? a : b, "");
            }
            
            finalData.push({
                id: row.id,
                title,
                slug: alias,
                description: hometext.replace(/<[^>]+>/g, '').trim(),
                image: image,
                bodyhtml
            });
        }
    }

    fs.writeFileSync('D:\\CDC\\webcq\\next-frontend\\news_data.json', JSON.stringify(finalData, null, 2));
    console.log(`Saved ${finalData.length} articles to news_data.json`);
}

extract();
