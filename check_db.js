const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payload-data.db');

// Add has_children column to distinguish parent items
db.run("ALTER TABLE header_menu_items ADD COLUMN has_children INTEGER DEFAULT 0", (err) => {
  if (err && !err.message.includes('duplicate')) console.error('has_children:', err.message);
  else console.log('has_children column ready');
});

// Create sub-menu items table
db.run(`
  CREATE TABLE IF NOT EXISTS header_menu_sub_items (
    _order INTEGER NOT NULL,
    _parent_id TEXT NOT NULL,
    id TEXT PRIMARY KEY,
    label TEXT,
    url TEXT,
    FOREIGN KEY (_parent_id) REFERENCES header_menu_items(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('sub_items table:', err.message);
  else console.log('header_menu_sub_items table ready');
  db.close();
});
