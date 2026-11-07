// Smoke test for the framework bindings: serves each built demo (frameworks/<fw>/demo/dist) and
// drives it in Chrome. Build the demos first: `npm run demo:build -ws`.
//
//   node frameworks/smoke.mjs [react vue angular]
//
// CHROME_PATH overrides the Chrome executable.

import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const frameworks = process.argv.slice(2).length ? process.argv.slice(2) : ['react', 'vue', 'angular'];
const chromePath =
  process.env.CHROME_PATH ??
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
  ].find(p => existsSync(p));

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' };

function serve(root) {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let file = path.join(root, decodeURIComponent(url.pathname));
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (!existsSync(file) || statSync(file).isDirectory()) file = path.join(root, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function state(page) {
  return JSON.parse(await page.$eval('#state', el => el.textContent ?? '{}'));
}

async function expectState(page, expected, step) {
  const deadline = Date.now() + 3000;
  let actual;
  while (Date.now() < deadline) {
    actual = await state(page);
    if (Object.entries(expected).every(([k, v]) => actual[k] === v)) return;
    await new Promise(r => setTimeout(r, 50));
  }
  throw new Error(`${step}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

async function run(framework, browser) {
  const root = path.join(here, framework, 'demo/dist');
  if (!existsSync(path.join(root, 'index.html'))) throw new Error(`${root} is not built`);
  const server = await serve(root);
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.stack ?? e.message));
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  try {
    await page.setViewport({ width: 480, height: 720 });
    await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() =>
      ['wc-button', 'wc-input', 'wc-switch', 'wc-select', 'wc-option'].every(t => customElements.get(t)),
    );
    await expectState(page, { clicks: 0, name: 'Ada', enabled: false, choice: 'alpha' }, 'initial');

    // State reaches the element as a property.
    const shown = await page.$eval('#name', el => el.value);
    if (shown !== 'Ada') throw new Error(`initial: wc-input shows "${shown}"`);
    const options = await page.$eval('#sel', el => el.options.length);
    if (options !== 2) throw new Error(`initial: wc-select got ${options} options`);

    await page.click('#btn');
    await expectState(page, { clicks: 1 }, 'button click');

    const input = await page.waitForSelector('#name >>> input');
    await input.click({ count: 3 });
    await page.keyboard.type('Grace');
    await expectState(page, { name: 'Grace' }, 'typing into wc-input');

    await page.click('#reset');
    await expectState(page, { name: 'reset' }, 'reset button');
    await page.waitForFunction(() => document.querySelector('#name').value === 'reset');

    await page.click('#sw');
    await expectState(page, { enabled: true }, 'switch toggle');

    await page.click('#sel');
    // Generated options carry their value as a property, so find Beta by it and click where it is.
    const box = await page.waitForFunction(() => {
      const option = [...document.querySelectorAll('#sel wc-option')].find(o => o.value === 'beta');
      const rect = option?.getBoundingClientRect();
      return rect && rect.height > 0 ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 } : null;
    });
    const { x, y } = await box.jsonValue();
    await page.mouse.click(x, y);
    await expectState(page, { choice: 'beta' }, 'select option');
    if (framework === 'angular') {
      // The typed (change) output relies on Angular's own DOM listener: it must fire, and once.
      await expectState(page, { lastChange: 'beta', changeCount: 1 }, 'select (change) output');
    }

    mkdirSync(path.join(here, '.smoke'), { recursive: true });
    await page.keyboard.press('Escape');
    await page.screenshot({ path: path.join(here, '.smoke', `${framework}.png`) });
    if (errors.length) throw new Error(`console errors:\n${errors.join('\n')}`);
    console.log(`ok   ${framework}`);
  } catch (error) {
    const undefinedTags = await page
      .evaluate(() =>
        [...new Set([...document.querySelectorAll(':not(:defined)')].map(el => el.localName)), ...['wc-button', 'wc-input', 'wc-switch', 'wc-select', 'wc-option'].filter(t => !customElements.get(t)).map(t => 'registry:' + t)],
      )
      .catch(() => []);
    mkdirSync(path.join(here, '.smoke'), { recursive: true });
    await page.screenshot({ path: path.join(here, '.smoke', `${framework}-failed.png`) }).catch(() => {});
    error.message += `\n  undefined elements: ${undefinedTags.join(', ') || 'none'}`;
    if (errors.length) error.message += `\n  console errors:\n    ${errors.join('\n    ')}`;
    throw error;
  } finally {
    await page.close();
    server.close();
  }
}

const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
let failed = false;
for (const framework of frameworks) {
  try {
    await run(framework, browser);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${framework}: ${error.message}`);
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
