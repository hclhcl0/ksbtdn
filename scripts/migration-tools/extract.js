const mysql = require('mysql2/promise');

async function extract() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'ksbtdana6a10_home',
      password: '8nX2Kx5xN3UkmRF3nB82',
      database: 'ksbtdana6a10_home'
    });
    
    console.log("Connected to MySQL successfully!");
    
    const [rows] = await connection.execute("SELECT config_name, config_value FROM tms_config WHERE module='global'");
    rows.forEach(r => console.log(r.config_name, '=', r.config_value));
    
    // Check about module if exists
    const [aboutRows] = await connection.execute("SELECT * FROM tms_about LIMIT 1").catch(() => [[]]);
    if (aboutRows.length > 0) {
        console.log("About Content:");
        console.log(aboutRows[0]);
    }
    
    await connection.end();
  } catch(e) {
    console.error("MySQL Error:", e.message);
  }
}
extract();
