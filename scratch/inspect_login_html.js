const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const url = 'https://ksbtdn.vercel.app/admin/login';
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  console.log('⏳ Waiting 5s for client-side render...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const elements = await page.evaluate(() => {
    const getElTree = (el, depth = 0) => {
      if (!el || depth > 5) return '';
      const children = Array.from(el.children).map(c => getElTree(c, depth + 1)).filter(Boolean);
      const childStr = children.length > 0 ? `\n${children.join('\n')}`.replace(/\n/g, '\n  ') + '\n' : '';
      return `<${el.tagName.toLowerCase()}${el.className ? ' class="' + el.className + '"' : ''}>${childStr}</${el.tagName.toLowerCase()}>`;
    };
    
    // Find the main login container or form parent
    const form = document.querySelector('form');
    if (!form) return 'No form found';
    
    // Get tree up to 3 levels above the form
    let parent = form;
    for (let i = 0; i < 3; i++) {
      if (parent.parentElement) parent = parent.parentElement;
    }
    
    return getElTree(parent);
  });
  
  console.log('HTML Tree around form:\n', elements);
  
  await browser.close();
})();
