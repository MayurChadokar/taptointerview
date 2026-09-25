import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { puppeteer } from 'file:///C:/Users/mayur/AppData/Local/npm-cache/_npx/15c61037b1978c83/node_modules/chrome-devtools-mcp/build/src/third_party/index.js';

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu', '--no-first-run'] });
const results = [];
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await mkdir('.tmp/mobile-check', { recursive: true });
  for (const width of [320, 375, 390, 480, 768, 1024, 1440]) {
    await page.setViewport({ width, height: 900, isMobile: width < 768, hasTouch: width < 768 });
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
    await page.waitForSelector('app-product-mockup .product-window');
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const selectors = ['.hero-product', '.hero-copy', '.benefit-grid', '.path-comparison', '.channels', '.result-panels', '.position-grid', '.demo-grid', '.footer-main', '.workflow-product', '.perspective-wrap', '.testimonial-layout', '.pricing-frame'];
      const overflow = selectors.flatMap(selector => [...document.querySelectorAll(selector)].flatMap(element => {
        const rect = element.getBoundingClientRect();
        return rect.width && (rect.left < -2 || rect.right > innerWidth + 2) ? [{ selector, left: Math.round(rect.left), right: Math.round(rect.right) }] : [];
      }));
      const mock = document.querySelector('app-product-mockup');
      const window = mock.querySelector('.product-window');
      return { viewport: innerWidth, pageWidth: document.documentElement.scrollWidth, overflow, mockWidth: Math.round(window.getBoundingClientRect().width), mockFont: getComputedStyle(window).fontSize, mobileNav: getComputedStyle(document.querySelector('.menu-toggle')).display };
    });
    results.push({ width, ...layout });
    if (width === 390 || width === 1440) await page.screenshot({ path: `.tmp/mobile-check/home-${width}.png`, fullPage: true });
    if (width <= 1080) {
      await page.click('.menu-toggle');
      await page.waitForSelector('app-header nav.is-open');
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('app-header nav.is-open'));
    }
    if (width === 320 || width === 390) {
      for (const tab of ['My Queue', 'Dashboard', 'My Jobs', 'Post Job', 'Team', 'Settings', 'Credits']) {
        await page.evaluate(tab => {
          const mock = document.querySelector('app-product-mockup');
          [...mock.querySelectorAll('.side-link')].find(button => button.textContent.trim() === tab).click();
        }, tab);
        await page.waitForFunction(tab => document.querySelector('app-product-mockup .side-link.active').textContent.trim() === tab, {}, tab);
        const contentOverflow = await page.evaluate(() => {
          const content = document.querySelector('app-product-mockup .product-content');
          return { width: content.clientWidth, scrollWidth: content.scrollWidth };
        });
        results.push({ viewport: width, tab, ...contentOverflow });
        if (contentOverflow.scrollWidth > contentOverflow.width + 2) await page.screenshot({ path: `.tmp/mobile-check/overflow-${width}-${tab.replaceAll(' ', '-')}.png`, fullPage: true });
      }
    }
  }
  console.log(JSON.stringify({ results, errors }, null, 2));
  assert(errors.length === 0, 'Browser runtime errors');
  assert(results.filter(result => result.pageWidth).every(result => result.pageWidth <= result.viewport + 2 && result.overflow.length === 0), 'Marketing page overflow detected');
  assert(results.filter(result => result.tab).every(result => result.scrollWidth <= result.width + 2), 'Product tab overflow detected');
} finally { await browser.close(); }
