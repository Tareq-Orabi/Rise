import { chromium } from 'playwright-core';
import { execFile } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { plans } from '../src/plan-content.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const htmlPath = path.join(projectRoot, 'dist/index.html');
const outputDir = path.join(projectRoot, 'pdf');
const run = promisify(execFile);
const planId = process.argv[2];
const selected = planId ? plans.filter(plan => plan.id === planId) : plans;
if (!selected.length) throw new Error('Unknown plan ID: ' + planId);
await access(htmlPath).catch(() => { throw new Error('Run npm run build first.'); });
await mkdir(outputDir, { recursive: true });

async function locateChromium() {
  if (process.env.CHROMIUM_PATH) {
    await access(process.env.CHROMIUM_PATH).catch(() => { throw new Error('CHROMIUM_PATH does not exist'); });
    return process.env.CHROMIUM_PATH;
  }
  const possible = [
    chromium.executablePath(), '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
    process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe')
  ].filter(Boolean);
  for (const candidate of possible) {
    try { await access(candidate); return candidate; } catch { /* Try the next installation. */ }
  }
  throw new Error('Install Chromium with npx playwright-core install chromium or set CHROMIUM_PATH to Chrome.');
}

// Sections can grow across multiple sheets after an edit; the initial release uses exact counts in QA.
async function checkPageCount(file, expected) {
  let report;
  try { report = await run('pdfinfo', [file], { env: { ...process.env, LC_ALL: 'C' } }); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  const count = Number(/^Pages:\s*(\d+)/m.exec(report.stdout)?.[1]);
  if (!Number.isFinite(count) || count < expected || (process.env.STRICT_PDF_PAGES === '1' && count !== expected)) {
    throw new Error(path.basename(file) + ': expected ' + expected + ' physical pages but found ' + count);
  }
  if (count > expected) console.warn(path.basename(file) + ': ' + expected + ' sections use ' + count + ' sheets.');
}

const browser = await chromium.launch({ executablePath: await locateChromium(), headless: true });
const staging = await mkdtemp(path.join(outputDir, '.export-'));
try {
  for (const plan of selected) {
    const page = await browser.newPage({ locale: 'ar-JO' });
    const externalRequests = [];
    const runtimeErrors = [];
    page.on('pageerror', error => runtimeErrors.push(error.message));
    await page.route(/^https?:\/\//, async route => {
      externalRequests.push(route.request().url());
      await route.abort();
    });
    await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
    const location = pathToFileURL(htmlPath);
    location.searchParams.set('print', plan.id);
    location.hash = '/plan/' + encodeURIComponent(plan.id) + '/1';
    await page.goto(location.href, { waitUntil: 'load' });
    await page.waitForFunction(expected => document.querySelectorAll('[data-print-page]').length === expected,
      plan.pages.length, { timeout: 12000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const media = document.querySelectorAll('[data-print-page] img');
      await Promise.all([...media].map(image => image.decode()));
    });
    if (runtimeErrors.length || externalRequests.length) {
      throw new Error(plan.id + ' rendering errors: ' + [...runtimeErrors, ...externalRequests].join(', '));
    }
    const file = path.join(staging, plan.id + '.pdf');
    await page.pdf({ path: file, format: 'A4', preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
    await page.close();
    await checkPageCount(file, plan.pages.length);
    const signature = (await readFile(file)).subarray(0, 5).toString('ascii');
    if (signature !== '%PDF-') throw new Error('Unexpected file format for ' + file);
    console.log('Rendered ' + plan.id + ' (' + plan.pages.length + ' pages).');
  }
  for (const plan of selected) {
    const name = plan.id + '.pdf';
    await rename(path.join(staging, name), path.join(outputDir, name));
  }
} finally {
  await browser.close();
  await rm(staging, { recursive: true, force: true });
}
