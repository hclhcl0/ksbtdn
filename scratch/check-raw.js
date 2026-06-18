const Database = require('better-sqlite3');
const db = new Database('D:/CDC/webcq/payload-data.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name).join(', '));
if (tables.some(t => t.name === 'articles')) {
  const count = db.prepare('SELECT count(*) as c FROM articles').get();
  console.log('Raw articles count:', count);
}
if (tables.some(t => t.name === 'media')) {
  const count = db.prepare('SELECT count(*) as c FROM media').get();
  console.log('Raw media count:', count);
}
