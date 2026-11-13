import { test, expect } from '@playwright/test';
import { watch, expectNoOverflow, untranslated, openHome } from './helpers.js';

const SLUGS = ['duz', 'tenteli', 'tanker', 'lowbed', 'damper', 'kasa'];
const PATHS = ['/', '/urunler/?skip', '/kurumsal/', '/galeri/', '/katalog/', '/servis-agi/', '/satis-sonrasi/', '/indir/', '/sartname/?tip=lowbed', '/iletisim/', '/gizlilik/', ...SLUGS.map((s) => `/urun/${s}/`)];

for (const lang of ['tr', 'en']) {
  test(`${lang}: tüm sayfalar temiz (konsol, kırık istek, taşma), html lang doğru`, async ({ page }) => {
    const errors = watch(page);
    const missing = {};
    for (const p of PATHS) {
      const url = lang === 'en' ? `/en${p}` : p;
      await page.goto(url);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('.foot-wrap')).toBeVisible();
      await expectNoOverflow(page);
      await expect(page.locator('.nav-cta')).toHaveText(lang === 'en' ? 'get a quote' : 'teklif al');
      if (lang === 'en') {
        const m = await untranslated(page);
        const head = await page.evaluate(() => [document.title, document.querySelector('meta[name=description]')?.content ?? ''].filter((x) => /[çğıöşüÇĞİÖŞÜ]/.test(x)));
        if (m.length || head.length) missing[url] = [...m, ...head];
      }
    }
    expect(missing, 'çevrilmemiş metin (content/i18n/en.ts)').toEqual({});
    expect(errors).toEqual([]);
  });
}

test('SEO: her sayfada başlık, açıklama, canonical ve dil alternatifleri sunucu HTML\'inde', async ({ request }) => {
  for (const p of ['/', '/kurumsal/', '/urun/tanker/', '/en/', '/en/urun/tanker/']) {
    const html = await (await request.get(p)).text();
    expect(html, p).toMatch(/<title>[^<]{5,}<\/title>/);
    expect(html, p).toMatch(/<meta name="description" content="[^"]{20,}"/);
    expect(html, p).toMatch(/<link rel="canonical" href="https:\/\/[^"]+"/);
    expect(html, p).toMatch(/hrefLang="tr"|hreflang="tr"/);
    expect(html, p).toMatch(/hrefLang="en"|hreflang="en"/);
    expect(html, p).toMatch(/<h1[ >]/);
  }
  const sm = await (await request.get('/sitemap.xml')).text();
  expect(sm).toContain('/en/urun/tanker/');
  expect(sm).toContain('/urun/tanker/');
});

test('robots.txt, JSON-LD, favicon ve paylaşım görseli', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://');
  expect(robots).toContain('Disallow: /sartname/');
  const home = await (await request.get('/')).text();
  const ld = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  expect(ld(home).map((x) => x['@type'])).toContain('Organization');
  const prod = ld(await (await request.get('/urun/tanker/')).text());
  expect(prod.map((x) => x['@type'])).toEqual(expect.arrayContaining(['Product', 'BreadcrumbList']));
  expect(prod.find((x) => x['@type'] === 'Product').name).toBe('Tanker');
  // favicon ve varsayılan paylaşım görseli gerçekten servis edilir
  const icon = home.match(/<link rel="icon" href="([^"]+)"/)?.[1];
  expect(icon, 'icon bağlantısı').toBeTruthy();
  expect((await request.get(icon)).status()).toBe(200);
  const og = (await (await request.get('/kurumsal/')).text()).match(/property="og:image" content="([^"]+)"/)?.[1];
  expect(og, 'kurumsal sayfa og:image').toBeTruthy();
  expect((await request.get(new URL(og).pathname)).status()).toBe(200);
  expect(await (await request.get('/en/')).text()).toContain('"@type":"Organization"');
});

test('kırık iç bağlantı ve görsel yok', async ({ page, request }, info) => {
  test.skip(info.project.name !== 'desktop', 'bağlantılar ekran boyutuna bağlı değil');
  const seen = new Set(), broken = [];
  for (const p of ['/', '/en/', ...PATHS.slice(1)]) {
    await page.goto(p);
    const refs = await page.evaluate(() => [
      ...[...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
      ...[...document.querySelectorAll('img[src]')].map((i) => i.getAttribute('src')),
    ]);
    for (const r of new Set(refs)) {
      if (!r.startsWith('/') || r.startsWith('//')) continue; // dış bağlantı, tel:, mailto:, #çapa
      const path = decodeURIComponent(new URL(r, 'http://x').pathname);
      if (seen.has(path)) continue;
      seen.add(path);
      if ((await request.get(path)).status() !== 200) broken.push(`${p} -> ${r}`);
    }
  }
  expect(seen.size).toBeGreaterThan(40);
  expect(broken).toEqual([]);
});

test('katalog: sayfalar basılır, PDF dosyaları yerinde', async ({ page, request }) => {
  await page.goto('/katalog/');
  await expect(page.locator('.sheet')).toHaveCount(9);
  await page.goto('/indir/'); // PDF adresleri content'ten (marka slug'ı) gelir, testte sabit yazılmaz
  for (const lang of ['tr', 'en']) {
    const href = await page.locator(`a[download][href$="katalog-${lang}.pdf"]`).getAttribute('href');
    const res = await request.get(href);
    expect(res.status()).toBe(200);
    expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');
  }
});

test('404: bilinmeyen adres 404 sayfası verir', async ({ request }) => {
  expect((await request.get('/yok/')).status()).toBe(404);
});

test('GLB override: ?glb= ile gerçek model sahneye girer, hatalı dosyada örnek model kalır', async ({ page }) => {
  await openHome(page, '/?glb=/models/ornek.glb');
  await expect(page.locator('#stage')).toHaveAttribute('data-model', 'glb');
  await page.goto('/urun/duz/?glb=/models/ornek.glb');
  await expect(page.locator('.viewer')).toHaveAttribute('data-model', 'glb');
  await openHome(page, '/?glb=/models/yok.glb');
  await expect(page.locator('#stage')).toHaveAttribute('data-model', 'procedural');
});

// Üst menü dar ekranda taşmamalı: menü düğmesi ve teklif butonu görünür alanda kalmalı (ekran 320-390 px)
for (const width of [320, 390]) {
  test(`mobil menü düğmesi ekran içinde (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/iletisim/');
    for (const sel of ['.burger', '.nav-cta']) {
      const box = await page.locator(sel).boundingBox();
      expect(box.x + box.width, sel).toBeLessThanOrEqual(width);
    }
  });
}
