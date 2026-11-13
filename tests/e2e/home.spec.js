import { test, expect } from '@playwright/test';
import { watch, scrollActs, expectNoOverflow, openHome } from './helpers.js';

// Yapılandırıcıda seçeneğe tıklar: önce o adıma geçer (1 Tip/Uzunluk, 2 Dingil, 3 Renk/Opsiyon)
async function pick(page, step, label) {
  await page.locator('#config .cfg-steps button').nth(step - 1).click();
  await page.locator(`#config .cfg-group[data-step="${step}"] button`, { hasText: new RegExp(`^${label}$`) }).first().click();
}

test.describe('ana sayfa: üç perde', () => {
  test('kaydırma perdeleri sırayla açar, sahne çizilir, konsol temiz', async ({ page }) => {
    const errors = watch(page);
    await openHome(page);
    const acts = page.locator('#acts');
    await expect(acts).toHaveAttribute('data-act', '1');
    await expect(page.locator('.a1 h1')).toBeVisible();
    await expect(page.locator('.a1 .lead')).toContainText('treyler üretiyoruz');
    await expect(page.locator('.hero-groups a')).toHaveCount(6);
    await expect(page.locator('.a1 .cta .btn').first()).toBeInViewport();
    await expect(page.locator('.hero-contact a').first()).toBeInViewport();
    expect((await page.locator('#stage').screenshot()).length).toBeGreaterThan(15_000); // tuval boş değil

    await scrollActs(page, 0.5);
    await expect(acts).toHaveAttribute('data-act', '2');
    await expect(page.locator('#dims [data-d="len-t"]')).toContainText('13,60 m');
    await expect(page.locator('#dims [data-d="kp-t"]')).toHaveText('KINGPIN');

    await scrollActs(page, 0.9);
    await expect(acts).toHaveAttribute('data-act', '3');
    await expect(page.locator('#config')).toBeVisible();
    await expect(page.locator('.rail button.on')).toHaveText('yapılandır');
    expect(errors).toEqual([]);
  });

  test('teknik çizim: etiketler birbirine binmez (tüm tip ve dingil sayıları)', async ({ page }) => {
    await openHome(page);
    await scrollActs(page, 0.9);
    await expect(page.locator('#acts')).toHaveAttribute('data-act', '3');
    for (const type of ['Düz platform', 'Tenteli', 'Tanker', 'Kapalı kasa']) {
      for (const axles of ['2', '4']) {
        await pick(page, 1, type);
        await pick(page, 2, axles);
        await scrollActs(page, 0.5);
        await expect(page.locator('#acts')).toHaveAttribute('data-act', '2');
        await expect(page.locator('#dims [data-d="ax0-t"]')).toBeVisible();
        const boxes = await page.locator('#dims text:not([display="none"])').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { id: e.dataset.d, l: r.left, t: r.top, r: r.right, b: r.bottom }; }));
        expect(boxes.length).toBeGreaterThanOrEqual(4 + +axles - 1);
        for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i], b = boxes[j];
          expect(a.l < b.r - 1 && a.r > b.l + 1 && a.t < b.b - 1 && a.b > b.t + 1, `${type}/${axles}: ${a.id} ile ${b.id} çakışıyor`).toBe(false);
        }
        await scrollActs(page, 0.9);
        await expect(page.locator('#acts')).toHaveAttribute('data-act', '3');
      }
    }
  });
});

test.describe('yapılandırıcı', () => {
  test('seçimler değerleri günceller ve teklif formuna taşınır', async ({ page }) => {
    const errors = watch(page);
    await openHome(page);
    await scrollActs(page, 0.9);
    const spec = page.locator('.cfg-spec dd');
    await expect(spec.first()).toHaveText('32,8 t'); // düz, 13,6 m, 3 dingil

    await pick(page, 1, 'Tanker');
    await expect(page.locator('.cfg-spec dt').nth(1)).toHaveText('Hacim');
    await expect(spec.nth(1)).toHaveText('35.910 L');
    await pick(page, 2, '4');
    await pick(page, 3, 'Yemek dolabı');
    await page.locator('#config .cfg-steps button').nth(3).click();
    await expect(page.locator('.cfg-sum')).toContainText('Tanker');
    await expect(page.locator('.cfg-sum')).toContainText('Yemek dolabı');

    const quote = page.locator('#config a.btn', { hasText: 'Teklif Al' });
    const href = await quote.getAttribute('href');
    expect(href).toContain('tip=tanker');
    expect(href).toContain('dingil=4');
    await quote.click();
    await expect(page).toHaveURL(/\/iletisim\/\?tip=tanker/);
    await expect(page.locator('#q-tip')).toHaveValue('tanker');
    await expect(page.locator('#q-msg')).toHaveValue(/Yapılandırma: 13,6 m, 4 dingil/);
    expect(errors).toEqual([]);
  });

  test('?tip= ile doğrudan açılış', async ({ page }) => {
    await openHome(page, '/?tip=kasa');
    await scrollActs(page, 0.9);
    await expect(page.locator('#config .cfg-group[data-step="1"] button[aria-pressed="true"]').first()).toHaveText('Kapalı kasa');
  });
});

test('yerleşim: yatay taşma yok (perdeler ve sayfa sonu)', async ({ page }) => {
  await openHome(page);
  for (const p of [0, 0.5, 0.9]) { await scrollActs(page, p); await expectNoOverflow(page); }
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expectNoOverflow(page);
});

test('tanıtım filmi: bölüm var, dosyalar yerinde, kendiliğinden oynamaz', async ({ page, request }) => {
  await page.goto('/');
  const video = page.locator('#film video');
  await expect(video).toHaveAttribute('controls', '');
  await expect(video).not.toHaveAttribute('autoplay', /.*/);
  const poster = await video.getAttribute('poster');
  const src = await page.locator('#film source').getAttribute('src');
  for (const url of [poster, src]) expect((await request.get(url)).status(), url).toBe(200);
  expect(await video.evaluate((v) => v.paused)).toBe(true);
});
