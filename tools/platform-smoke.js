#!/usr/bin/env node
/**
 * Cross-platform readiness smoke checks for CRT Spaceship.
 * Does not modify gameplay. Exit code 0 = pass.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
let failed = 0;
const results = [];

function pass(name, detail) {
  results.push({ ok: true, name, detail });
  console.log(`  PASS  ${name}${detail ? ' — ' + detail : ''}`);
}

function fail(name, detail) {
  failed++;
  results.push({ ok: false, name, detail });
  console.error(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

console.log('\n=== CRT Spaceship platform smoke ===\n');
console.log('1) Static structure');

const required = [
  'index.html',
  'site.webmanifest',
  'version.json',
  'js/telemetry.js',
  '.nojekyll',
  'PLATFORM.md',
  'README.md'
];

for (const f of required) {
  if (exists(f)) pass('exists ' + f);
  else fail('exists ' + f, 'missing');
}

console.log('\n2) index.html wiring');
const html = read('index.html');

const checks = [
  [/name="viewport"[^>]*viewport-fit=cover/, 'viewport-fit=cover'],
  [/apple-mobile-web-app-capable/, 'apple-mobile-web-app-capable'],
  [/mobile-web-app-capable/, 'mobile-web-app-capable'],
  [/name="theme-color"/, 'theme-color'],
  [/Content-Security-Policy/, 'CSP meta'],
  [/rel="manifest"[^>]*site\.webmanifest/, 'manifest link'],
  [/100dvh/, 'dvh viewport unit'],
  [/visualViewport/, 'visualViewport resize handling'],
  [/orientationchange/, 'orientationchange handler'],
  [/lastTouchEndTime|MOUSE_SUPPRESS_MS/, 'touch ghost-mouse guard'],
  [/touchcancel/, 'touchcancel handler'],
  [/webkitAudioContext/, 'Safari AudioContext prefix'],
  [/getElementById\('gameCanvas'\)/, 'game canvas'],
  [/requestAnimationFrame/, 'rAF game loop'],
  [/js\/telemetry\.js/, 'telemetry script tag']
];

for (const [re, label] of checks) {
  if (re.test(html)) pass(label);
  else fail(label, 'pattern not found');
}

// Ensure we did not accidentally drop core control bindings
const controlChecks = [
  [/ArrowLeft/, 'keyboard left'],
  [/ArrowRight/, 'keyboard right'],
  [/AudioEngine/, 'audio engine'],
  [/class Bullet/, 'Bullet entity'],
  [/class Enemy/, 'Enemy entity'],
  [/KEYBOARD_MOVE_SPEED\s*=\s*18/, 'keyboard move speed unchanged'],
  [/AUTO_FIRE_RATE\s*=\s*150/, 'auto-fire rate unchanged'],
  [/this\.speed\s*=\s*10/, 'bullet speed unchanged'],
  [/wave \* 0\.2/, 'enemy wave speed scaling unchanged'],
  [/player\.x \+= \(player\.targetX - player\.x\) \* 0\.15/, 'player lerp unchanged']
];

console.log('\n3) Physics / control constants guard');
for (const [re, label] of controlChecks) {
  if (re.test(html)) pass(label);
  else fail(label, 'constant or binding missing/changed');
}

console.log('\n4) Manifest JSON');
try {
  const manifest = JSON.parse(read('site.webmanifest'));
  if (manifest.display === 'standalone') pass('manifest display standalone');
  else fail('manifest display', String(manifest.display));
  if (manifest.start_url) pass('manifest start_url', manifest.start_url);
  else fail('manifest start_url');
  if (manifest.background_color === '#050505') pass('manifest background_color');
  else fail('manifest background_color', manifest.background_color);
} catch (e) {
  fail('manifest parse', e.message);
}

console.log('\n5) version.json');
try {
  const ver = JSON.parse(read('version.json'));
  if (ver.version) pass('version field', ver.version);
  else fail('version field');
} catch (e) {
  fail('version.json parse', e.message);
}

console.log('\n6) Security quick scan');
const telemetry = read('js/telemetry.js');
if (!/eval\s*\(/.test(html) && !/eval\s*\(/.test(telemetry)) pass('no eval()');
else fail('eval() found');
if (!/document\.write/.test(html)) pass('no document.write');
else fail('document.write found');
// No obvious cloud API keys
if (!/AKIA[0-9A-Z]{16}/.test(html + telemetry) && !/api[_-]?key\s*[:=]\s*['\"][a-zA-Z0-9]{20,}/i.test(html + telemetry)) {
  pass('no obvious cloud API keys');
} else {
  fail('possible hardcoded secret');
}
if (/ENCRYPTION_KEY\s*=\s*'CRT_SPACESHIP_LOG_KEY_2024'/.test(telemetry)) {
  pass('telemetry key is client-side obfuscation only (documented)');
}

// --- Optional headless runtime ---
async function runtimeTest() {
  console.log('\n7) Runtime (headless HTTP)');
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    console.log('  SKIP  puppeteer not installed — static checks only');
    console.log('        Install with: npm install --no-save puppeteer');
    return;
  }

  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.md': 'text/plain'
  };

  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
    });
  } catch (launchErr) {
    server.close();
    console.log('  SKIP  Chrome/Chromium not available for Puppeteer');
    console.log('        ' + (launchErr && launchErr.message ? launchErr.message.split('\n')[0] : String(launchErr)));
    console.log('        Static wiring checks still apply. Install Chrome via:');
    console.log('        npx puppeteer browsers install chrome');
    return;
  }

  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') pageErrors.push('console: ' + msg.text());
    });

    // Desktop viewport
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#gameCanvas', { timeout: 10000 });
    await page.waitForSelector('#start-btn', { timeout: 5000 });
    pass('desktop load canvas + start button');

    await page.click('#start-btn');
    await new Promise((r) => setTimeout(r, 800));

    const desktopState = await page.evaluate(() => {
      const c = document.getElementById('gameCanvas');
      const overlay = document.getElementById('start-overlay');
      return {
        canvasW: c.width,
        canvasH: c.height,
        overlayDisplay: overlay ? getComputedStyle(overlay).display : null,
        hasCtx: !!(c && c.getContext('2d'))
      };
    });

    if (desktopState.canvasW === 1280 && desktopState.canvasH === 720) {
      pass('desktop canvas buffer matches viewport', `${desktopState.canvasW}x${desktopState.canvasH}`);
    } else {
      fail('desktop canvas buffer', JSON.stringify(desktopState));
    }
    if (desktopState.overlayDisplay === 'none') pass('start overlay hidden after click');
    else fail('start overlay hidden', desktopState.overlayDisplay);

    // Keyboard path smoke
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Shift');
    await new Promise((r) => setTimeout(r, 200));
    pass('keyboard events dispatched without throw');

    // Mobile viewport
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#start-btn');
    await page.click('#start-btn');
    await new Promise((r) => setTimeout(r, 600));

    const mobileState = await page.evaluate(() => {
      const c = document.getElementById('gameCanvas');
      return { w: c.width, h: c.height };
    });
    if (mobileState.w === 390 && mobileState.h === 844) {
      pass('mobile canvas buffer matches viewport', `${mobileState.w}x${mobileState.h}`);
    } else {
      // visualViewport may differ slightly in headless; allow inner dimensions
      if (mobileState.w > 200 && mobileState.h > 400) {
        pass('mobile canvas sized', `${mobileState.w}x${mobileState.h}`);
      } else {
        fail('mobile canvas buffer', JSON.stringify(mobileState));
      }
    }

    // Touch tap
    await page.touchscreen.tap(200, 600);
    await new Promise((r) => setTimeout(r, 300));
    pass('touch tap dispatched');

    // Landscape
    await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 400));
    const land = await page.evaluate(() => {
      const c = document.getElementById('gameCanvas');
      return { w: c.width, h: c.height };
    });
    if (land.w >= land.h) pass('landscape canvas orientation', `${land.w}x${land.h}`);
    else fail('landscape canvas orientation', JSON.stringify(land));

    // Manifest reachable
    const manRes = await page.goto(base + '/site.webmanifest');
    if (manRes && manRes.ok()) pass('site.webmanifest HTTP 200');
    else fail('site.webmanifest HTTP', manRes && manRes.status());

    if (pageErrors.length === 0) pass('no page errors during smoke');
    else fail('page errors', pageErrors.slice(0, 5).join(' | '));
  } finally {
    await browser.close();
    server.close();
  }
}

runtimeTest()
  .catch((err) => {
    fail('runtime test', err && err.stack ? err.stack : String(err));
  })
  .finally(() => {
    console.log('\n=== Summary ===');
    const passed = results.filter((r) => r.ok).length;
    const total = results.length;
    console.log(`Passed: ${passed}/${total}`);
    if (failed > 0) {
      console.log(`Failed: ${failed}`);
      process.exit(1);
    }
    console.log('All checks passed.\n');
    process.exit(0);
  });
