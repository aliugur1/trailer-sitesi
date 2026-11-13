import { expect } from '@playwright/test';

// Konsol hatası ve kırık istekleri toplar; test sonunda boş olmalı.
export function watch(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  return errors;
}

export async function expectNoOverflow(page) {
  const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(o.sw, `yatay taşma: ${page.url()}`).toBeLessThanOrEqual(o.cw);
}

// Üç perdeli sahnede ilerlemeyi (0..1) kaydırarak ayarlar.
export async function scrollActs(page, p) {
  await page.evaluate((v) => {
    const a = document.querySelector('#acts');
    scrollTo(0, a.offsetTop + v * (a.offsetHeight - innerHeight));
  }, p);
}

export async function openHome(page, path = '/') {
  await page.goto(`${path}${path.includes('?') ? '&' : '?'}hq`);
  await expect(page.locator('#acts')).toHaveClass(/live/);
}

// Türkçeye özgü harf içeren görünür metin = sözlükte eksik çeviri
export const untranslated = (page) => page.evaluate(() => {
  const out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const s = n.data.trim();
    if (s && /[çğıöşüÇĞİÖŞÜ]/.test(s) && !n.parentElement.closest('script,style,.lang,noscript,[translate="no"]')) out.push(s);
  }
  return out;
});
