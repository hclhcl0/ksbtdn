const http = require('http');

http.get('http://localhost:3000/api/globals/header', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Payload Header REST API response:");
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log("Error parsing JSON:", e.message);
      console.log("Raw Response:", data);
    }
  });
}).on('error', err => console.error(err));
