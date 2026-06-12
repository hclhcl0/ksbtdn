const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payload-data.db');

db.serialize(() => {
  db.run("DROP INDEX IF EXISTS banners_image_idx;");
  db.run("DROP INDEX IF EXISTS banners_mobile_image_idx;");
});

db.close((err) => {
  if (err) console.error(err.message);
  else console.log("Dropped banner indexes.");
});
