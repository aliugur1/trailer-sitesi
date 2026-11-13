// 3D sahneden görsel üretir: ürün küçük resimleri (saydam PNG), galeri (JPG) ve ana sayfa kapağı.
// Kullanım: npm run stills   (önce `next build` yapılmış olmalı, out/ yerel olarak sunulur)
// Model ya da sahne değişince yeniden çalıştırın. Gerçek fotoğraf kullanılan galeri satırlarında shot olmadığı için atlanır.
// STILLS_OUT=/yol ile çıktıyı başka klasöre yazar (denemek için). PW_CHROMIUM=/yol/chrome ile var olan Chromium kullanılır.
import { chromium } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { GALLERY } from '../content/gallery.ts';
import { PRODUCTS } from '../content/site.ts';

const OUT = process.env.STILLS_OUT ?? 'public';
const PORT = 5199;
const server = spawn('node', ['scripts/serve-out.mjs'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1200));
const base = `http://127.0.0.1:${PORT}`;
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const FULL = 'header.nav,.float,footer,.pdp-bar,.crumb-wrap{display:none!important}.viewer{position:fixed!important;inset:0!important;min-height:0!important;border:0!important;border-radius:0!important;z-index:99}';

async function viewerShot(file, { w, h, query, transparent }) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const [slug, ...rest] = query;
  await page.goto(`${base}/urun/${slug}/?still&${rest.join('&')}`);
  await page.addStyleTag({ content: FULL + 'body *{visibility:hidden!important}.viewer,.viewer *{visibility:visible!important}' + (transparent ? 'html,body,.viewer{background:transparent!important}' : '') });
  await page.waitForSelector('.viewer[data-ready]');
  await page.waitForTimeout(700); // yeniden boyutlanma ve doku yüklemesi otursun
  const path = join(OUT, file);
  await mkdir(dirname(path), { recursive: true });
  await page.screenshot({ path, omitBackground: !!transparent, type: transparent ? 'png' : 'jpeg', ...(transparent ? {} : { quality: 84 }) });
  await page.close();
  console.log('✓', path);
}
const qs = (o) => new URLSearchParams(o).toString();

try {
  for (const p of PRODUCTS) {
    await viewerShot(`img/${p.slug}.png`, { w: 1200, h: 800, query: [p.slug], transparent: true });
    // sayfa içinde küçük WebP kullanılır (PNG paylaşım kartı ve yapısal veri için kalır)
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(OUT, `img/${p.slug}.png`), '-c:v', 'libwebp', '-quality', '88', '-compression_level', '6', join(OUT, `img/${p.slug}.webp`)]);
  }
  await viewerShot('img/hero-rig.png', { w: 2000, h: 1100, query: ['duz', qs({ model: 'rig' })], transparent: true });
  for (const g of GALLERY) {
    if (!g.shot) continue;
    const { slug = 'duz', model, ...frame } = g.shot;
    await viewerShot(`img/galeri/${g.src}`, { w: 1600, h: 1000, query: [slug, qs({ ...(model ? { model } : {}), ...frame })] });
  }
  // ana sayfa kapağı: ilk perde, arayüz gizli
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await page.goto(`${base}/?hq`);
  await page.waitForSelector('#acts.live');
  await page.addStyleTag({ content: 'header.nav,.act,.rail,.scrollhint,.float{display:none!important}' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(OUT, 'img/hero.jpg'), type: 'jpeg', quality: 82 });
  console.log('✓', join(OUT, 'img/hero.jpg'));
} finally {
  await browser.close();
  server.kill();
}
