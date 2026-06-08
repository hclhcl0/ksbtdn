const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payload-data.db');

const now = new Date().toISOString();

db.run(
  `INSERT INTO banner_settings (id, hero_slider_size, hero_slider_effect, hero_slider_autoplay_delay, updated_at, created_at)
   VALUES (1, 'medium', 'slide', 5000, ?, ?)`,
  [now, now],
  function(err) {
    if (err) {
      // Already exists, try UPDATE instead
      db.run(
        `UPDATE banner_settings SET hero_slider_size='medium', hero_slider_effect='slide', hero_slider_autoplay_delay=5000, updated_at=? WHERE id=1`,
        [now],
        (err2) => {
          if (err2) console.error("UPDATE error:", err2.message);
          else console.log("Updated existing row with defaults.");
          db.close();
        }
      );
    } else {
      console.log("Inserted default row into banner_settings.");
      db.close();
    }
  }
);
