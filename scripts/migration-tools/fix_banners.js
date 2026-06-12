const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payload-data.db');

const columnMappings = [
  { old: 'logo_height', new: 'logo_customization_logo_height', type: 'INTEGER DEFAULT 52' },
  { old: 'show_site_name', new: 'logo_customization_show_site_name', type: 'INTEGER DEFAULT 1' },
  { old: 'site_name_line1', new: 'logo_customization_site_name_line1', type: "TEXT DEFAULT 'TRUNG TÂM KIỂM SOÁT BỆNH TẬT'" },
  { old: 'site_name_line2', new: 'logo_customization_site_name_line2', type: "TEXT DEFAULT 'THÀNH PHỐ ĐÀ NẴNG'" },
  { old: 'site_tagline', new: 'logo_customization_site_tagline', type: 'TEXT' },
  { old: 'logo_position', new: 'logo_customization_logo_position', type: "TEXT DEFAULT 'left'" },
  { old: 'logo_banner_image_id', new: 'logo_customization_logo_banner_image_id', type: 'INTEGER' }
];

db.all("PRAGMA table_info(header)", [], (err, cols) => {
  if (err) {
    console.error(err);
    db.close();
    return;
  }
  const colNames = cols.map(c => c.name);
  
  let index = 0;
  function processNext() {
    if (index >= columnMappings.length) {
      console.log('All migrations completed.');
      db.close();
      return;
    }
    const mapping = columnMappings[index++];
    if (colNames.includes(mapping.new)) {
      console.log(`Column ${mapping.new} already exists.`);
      processNext();
    } else if (colNames.includes(mapping.old)) {
      console.log(`Renaming ${mapping.old} to ${mapping.new}...`);
      db.run(`ALTER TABLE header RENAME COLUMN ${mapping.old} TO ${mapping.new}`, (err) => {
        if (err) console.error(`Error renaming ${mapping.old}:`, err.message);
        else console.log(`Renamed ${mapping.old} to ${mapping.new}`);
        processNext();
      });
    } else {
      console.log(`Adding column ${mapping.new}...`);
      db.run(`ALTER TABLE header ADD COLUMN ${mapping.new} ${mapping.type}`, (err) => {
        if (err) console.error(`Error adding ${mapping.new}:`, err.message);
        else console.log(`Added ${mapping.new}`);
        processNext();
      });
    }
  }

  processNext();
});
