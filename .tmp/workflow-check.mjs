import assert from 'node:assert/strict';
import { puppeteer } from 'file:///C:/Users/mayur/AppData/Local/npm-cache/_npx/15c61037b1978c83/node_modules/chrome-devtools-mcp/build/src/third_party/index.js';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [320, 390, 1440]) {
    await page.setViewport({ width, height: 1000 });
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
    const section = await page.$('app-workflow-showcase');
    await section.scrollIntoView();
    if (width < 768) {
      assert(await page.$eval('.workflow-layout', el => getComputedStyle(el).gridTemplateColumns.split(' ').length === 1), 'Mobile workflow must stack');
      assert(await page.$$eval('.workflow-steps button', buttons => buttons.every(el => el.scrollWidth <= el.clientWidth + 2)), 'Step card content overflow');
    }
    for (let step = 0; step < 4; step++) {
      await page.click(`#workflow-step-${step}`);
      await page.waitForSelector(`.stage-${step}`);
      assert(await page.$eval('.workflow-product', el => el.scrollWidth <= el.clientWidth + 2), `Preview overflow ${width}, step ${step}`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `Page overflow ${width}`);
    }
    await page.click('#workflow-step-0');
    await section.screenshot({ path: `.tmp/workflow-${width}.png` });
  }
  await page.click('#workflow-step-1');
  await page.waitForSelector('.answer-options button');
  await page.click('.answer-options button');
  await page.waitForSelector('.continue-demo');
  await page.click('.continue-demo');
  await page.waitForSelector('.queue-action button');
  await page.click('.queue-action button');
  await page.waitForSelector('.interview-preview button');
  await page.click('.interview-preview button');
  await page.waitForFunction(() => document.querySelector('.interview-preview').textContent.includes('INTERVIEW COMPLETE'));
  await page.click('#workflow-step-0');
  await page.keyboard.press('ArrowRight');
  await page.waitForSelector('.stage-1');
  assert.deepEqual(errors, []);
  console.log('Passed: four steps at 320/390/1440px, no overflow, qualification-to-interview demo, keyboard navigation, no runtime errors.');
} finally { await browser.close(); }
