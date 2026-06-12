const fs = require('fs');
const html = fs.readFileSync('hcdc.html', 'utf8');

const navIndex = html.indexOf('class="sidenav__menu"');
if (navIndex !== -1) {
  const endIndex = html.indexOf('</ul>', navIndex);
  const menuHtml = html.substring(navIndex, endIndex);
  
  const aRegex = /<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const links = [];
  while ((match = aRegex.exec(menuHtml)) !== null) {
    const url = match[1];
    const label = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (label && label !== 'HCDC' && !label.includes('img-')) {
      links.push({ label, url });
    }
  }
  console.log(JSON.stringify(links, null, 2));
}
