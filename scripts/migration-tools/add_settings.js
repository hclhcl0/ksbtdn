const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payload-data.db');

db.run("ALTER TABLE settings ADD COLUMN hero_slider_effect TEXT DEFAULT 'slide';", (err) => {
  if (err) console.error(err.message);
  else console.log("Added hero_slider_effect column.");
  db.close();
});
