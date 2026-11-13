// PDF kataloğu üretir: /katalog/ ve /en/katalog/ sayfalarını yazdırır.
// Kullanım: npm run catalog   (önce `next build`)  ->  public/katalog/<slug>-katalog-{tr,en}.pdf
// content/ ya da ürün görselleri değişince yeniden çalıştırın, sonra tekrar `next build` yapın.
// CATALOG_OUT=/yol ile çıktıyı başka klasöre yazar. PW_CHROMIUM=/yol/chrome ile var olan Chromium kullanılır.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { SITE } from '../content/site.ts';

const OUT = process.env.CATALOG_OUT ?? 'public/katalog';
const PORT = 5198;
const server = spawn('node', ['scripts/serve-out.mjs'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1200));
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
await mkdir(OUT, { recursive: true });
try {
  for (const lang of ['tr', 'en']) {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${lang === 'en' ? '/en' : ''}/katalog/`);
    await page.waitForSelector('[data-catalog="ready"]');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); }));
    });
    const path = `${OUT}/${SITE.slug}-katalog-${lang}.pdf`;
    await page.pdf({ path, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log('✓', path);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
