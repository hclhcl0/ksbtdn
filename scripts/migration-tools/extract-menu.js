const fs = require('fs');
const html = fs.readFileSync('hcdc.html', 'utf8');

// The menu is usually inside a <nav> or a ul with class menu/nav.
// Let's use basic regex or simple parsing if cheerio is not installed.
// Since we have a Next.js project, cheerio might not be installed. Let's check for links inside the header.
// Actually, using jsdom or regex might be hard. Let's just run a quick script to find all <li> with <a> inside some nav.

const navMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i) || html.match(/<ul[^>]*id="[^"]*menu[^"]*"[^>]*>([\s\S]*?)<\/ul>/i) || html.match(/<ul[^>]*class="[^"]*menu[^"]*"[^>]*>([\s\S]*?)<\/ul>/i);

if (navMatch) {
  const navHtml = navMatch[1];
  console.log("Found nav HTML length:", navHtml.length);
  // Just print some lines to inspect
  console.log(navHtml.substring(0, 1000));
} else {
  console.log("Could not find nav element automatically. Looking for 'menu' keyword:");
  const lines = html.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('menu') && lines[i].includes('<ul')) {
      console.log(`Line ${i}: ${lines[i].trim()}`);
    }
  }
}
