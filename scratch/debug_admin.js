const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  // Listen for page errors
  page.on('pageerror', err => {
    console.error(`[BROWSER PAGEERROR] Uncaught exception:`, err.message);
  });

  const url = 'https://ksbtdn.vercel.app/admin/login';
  console.log(`📡 Navigating to ${url}...`);
  
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log(`📥 Page loaded. HTTP Status: ${response.status()}`);
    
    console.log('⏳ Waiting for 5 seconds for hydration...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check computed styles
    const styles = await page.evaluate(() => {
      const container = document.querySelector('.template-minimal');
      const wrap = document.querySelector('.template-minimal__wrap');
      return {
        containerBackground: container ? window.getComputedStyle(container).background : 'not found',
        wrapBackground: wrap ? window.getComputedStyle(wrap).background : 'not found',
        wrapBackdropFilter: wrap ? window.getComputedStyle(wrap).backdropFilter : 'not found'
      };
    });
    console.log('Computed Styles on Live Page:', styles);

    const screenshotPath = 'C:/Users/SingPC/.gemini/antigravity/brain/9a75ee47-7f7b-4997-8db8-d759f77aa78b/scratch/admin_translated.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to ${screenshotPath}`);
  } catch (error) {
    console.error('💥 Navigation failed:', error);
  } finally {
    await browser.close();
    console.log('🏁 Browser closed.');
  }
})();
