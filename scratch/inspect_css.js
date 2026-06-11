const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const url = 'https://ksbtdn.vercel.app/admin/login';
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const hasStyleRule = await page.evaluate(() => {
    // Check all stylesheets in document
    const results = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        const rules = sheet.cssRules || sheet.rules;
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          if (rule.cssText && rule.cssText.includes('1e3c72')) {
            results.push(rule.cssText);
          }
        }
      } catch (e) {
        // Cross-origin sheets can throw errors when reading cssRules
        results.push(`Cross-origin stylesheet: ${sheet.href} - Error: ${e.message}`);
      }
    }
    return results;
  });
  
  console.log('Style Rules found containing 1e3c72:', hasStyleRule);
  
  await browser.close();
})();
