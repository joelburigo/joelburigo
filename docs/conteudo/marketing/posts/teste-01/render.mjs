import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targets = [
  { html: 'post-a.html', out: 'post-a-v2.png' },
  { html: 'post-c.html', out: 'post-c.png' },
  { html: 'post-data-a.html', out: 'post-data-a.png' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1080, height: 1080 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

for (const t of targets) {
  const url = 'file://' + path.join(__dirname, t.html);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800); // ensure webfonts settled
  const el = await page.$('.post');
  await el.screenshot({ path: path.join(__dirname, t.out), type: 'png' });
  console.log('rendered', t.out);
}

await browser.close();
