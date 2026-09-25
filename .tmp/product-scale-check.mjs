import assert from 'node:assert/strict';
import { puppeteer } from 'file:///C:/Users/mayur/AppData/Local/npm-cache/_npx/15c61037b1978c83/node_modules/chrome-devtools-mcp/build/src/third_party/index.js';

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu', '--no-first-run'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.mock-desktop-canvas');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewport({ width, height: 900 });
    await new Promise(resolve => setTimeout(resolve, 350));
    const layouts = await page.$$eval('app-product-mockup', hosts => hosts.map(host => {
      const canvas = host.querySelector('.mock-desktop-canvas');
      const viewport = host.querySelector('.mock-viewport');
      const window = host.querySelector('.product-window');
      const links = [...host.querySelectorAll('.side-link')];
      const bounds = canvas.getBoundingClientRect();
      const matrix = new DOMMatrixReadOnly(getComputedStyle(canvas).transform);
      return {
        logicalWidth: canvas.offsetWidth, logicalHeight: canvas.offsetHeight,
        renderedWidth: bounds.width, renderedHeight: bounds.height,
        available: viewport.getBoundingClientRect().width,
        scaleX: matrix.a, scaleY: matrix.d,
        columns: getComputedStyle(window).gridTemplateColumns.split(' ').length,
        interviewColumns: getComputedStyle(host.querySelector('.interview-grid')).gridTemplateColumns.split(' ').length,
        labelsVisible: links.every(link => getComputedStyle(link.querySelector('span')).display !== 'none'),
        verticalNav: links.every((link, i) => !i || link.offsetTop > links[i - 1].offsetTop),
      };
    }));
    for (const layout of layouts) {
      assert.equal(layout.logicalWidth, 1200);
      assert.equal(layout.logicalHeight, 680);
      assert.equal(layout.columns, 2);
      assert.equal(layout.interviewColumns, 2);
      assert(layout.labelsVisible && layout.verticalNav);
      assert(layout.renderedWidth <= layout.available + 1);
      assert.equal(layout.scaleX, layout.scaleY);
      assert(layout.scaleX > 0);
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    console.log(JSON.stringify({ width, layouts }));
  }
  await page.setViewport({ width: 390, height: 844 });
  const host = await page.$('app-product-mockup');
  for (let index = 0; index < 7; index++) {
    const buttons = await host.$$('.side-link');
    await buttons[index].click();
    await page.waitForFunction(i => document.querySelectorAll('app-product-mockup .side-link')[i].classList.contains('active'), {}, index);
  }
  const buttons = await host.$$('.side-link');
  await buttons[1].click();
  await page.waitForSelector('app-product-mockup .interview-grid');
  await host.screenshot({ path: '.tmp/product-scale-mobile.png' });
  await (await host.$('.showcase-tools button')).click();
  await page.waitForFunction(() => !!document.fullscreenElement);
  await new Promise(resolve => setTimeout(resolve, 350));
  const fullscreen = await page.evaluate(() => {
    const host = document.fullscreenElement;
    const viewport = host.querySelector('.mock-viewport').getBoundingClientRect();
    const canvas = host.querySelector('.mock-desktop-canvas').getBoundingClientRect();
    return { fits: canvas.width <= viewport.width + 1 && canvas.height <= viewport.height + 1, sidebar: getComputedStyle(host.querySelector('.mock-sidebar')).display };
  });
  assert(fullscreen.fits);
  await (await host.$('.showcase-tools button')).click();
  await page.waitForFunction(() => !document.fullscreenElement);
  assert.deepEqual(errors, []);
  console.log('Both mockups retain desktop layout at all widths. All seven scaled tabs and fullscreen work; no runtime errors.');
} finally { await browser.close(); }
