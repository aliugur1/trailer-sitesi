import { test, expect } from '@playwright/test';
import { watch } from './helpers.js';

test('ana sayfa: yüke göre bulucu ürünleri süzer, servis araması ağa götürür', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#urunler .pcard:visible')).toHaveCount(6);
  await page.locator('#bulucu button', { hasText: 'Sıvı ve kimyasal' }).click();
  await expect(page.locator('#urunler .pcard:visible')).toHaveCount(1);
  await page.locator('#bulucu button', { hasText: 'Sıvı ve kimyasal' }).click(); // ikinci tıklama kaldırır
  await expect(page.locator('#urunler .pcard:visible')).toHaveCount(6);
  await page.locator('#net-home-q').fill('Konya');
  await page.locator('.net-search button').click();
  await expect(page).toHaveURL(/\/servis-agi\/\?q=Konya/);
  await expect(page.locator('.net-card:visible')).toHaveCount(1);
});

test('ürün listesi: filtre ve karşılaştırma', async ({ page }) => {
  await page.goto('/urunler/?skip#urun-listesi');
  await expect(page.locator('.lcard:visible')).toHaveCount(6);
  await page.locator('.filters label', { hasText: '4 ve üzeri' }).click();
  await expect(page.locator('.lcard:visible')).toHaveCount(1);
  await page.locator('.filters button', { hasText: 'Filtreyi temizle' }).click();
  await expect(page.locator('.lcard:visible')).toHaveCount(6);
  await page.locator('.cmp input').nth(0).check();
  await page.locator('.cmp input').nth(1).check();
  await page.locator('.cmp input').nth(2).check();
  await expect(page.locator('.cmp input').nth(3)).toBeDisabled(); // en çok üç ürün
  await page.locator('.cmp-bar button').click();
  await expect(page.locator('.cmp-dialog')).toBeVisible();
  expect(await page.locator('.cmp-dialog tbody tr').count()).toBeGreaterThan(8);
});

test('ürün detay: çizim, sekmeler, belgeler, sabit teklif çubuğu', async ({ page }) => {
  const errors = watch(page);
  await page.goto('/urun/tanker/');
  await expect(page.locator('h1')).toHaveText('Tanker');
  await expect(page.locator('.viewer canvas')).toHaveCount(1);
  await expect(page.locator('.drawing')).toContainText('13,30 m');
  await expect(page.locator('.pdp-bar')).not.toHaveClass(/on/);
  await page.locator('.tabs [role=tab]').nth(1).click();
  await expect(page.locator('.tabp:not([hidden])')).toHaveCount(1);
  await expect(page.locator('.doc')).toHaveCount(3);
  await page.evaluate(() => scrollTo(0, document.querySelector('.product-hero').offsetHeight + 400)); // hero bittikten sonra
  await expect(page.locator('.pdp-bar')).toHaveClass(/on/);
  await page.locator('.pdp-bar a.btn:not(.ghost)').click();
  await expect(page).toHaveURL(/\/iletisim\/\?tip=tanker/);
  await expect(page.locator('#q-tip')).toHaveValue('tanker');
  expect(errors).toEqual([]);
});

test('satış sonrası: şasi numarası sorgusu', async ({ page }) => {
  await page.goto('/satis-sonrasi/');
  await page.fill('#vin', 'abc');
  await page.locator('button[type=submit]').click();
  await expect(page.locator('#vin ~ .err')).toContainText('17 haneli');
  await page.locator('.linkish').click();
  await page.locator('button[type=submit]').click();
  await expect(page.locator('.vin-card h3')).toHaveText('Düz Platform Treyler');
  await expect(page.locator('.parts tbody tr')).toHaveCount(4);
});

test('servis ağı: tür filtresi, arama ve harita', async ({ page }) => {
  await page.goto('/servis-agi/');
  await expect(page.locator('.net-card:visible')).toHaveCount(8);
  await page.locator('.chips button', { hasText: 'Satış noktası' }).click();
  await expect(page.locator('.net-card:visible')).toHaveCount(3);
  await page.locator('.chips button', { hasText: 'Tümü' }).click();
  await page.fill('#net-q', 'zzz');
  await expect(page.locator('.empty')).toBeVisible();
  await page.fill('#net-q', 'ankara');
  await expect(page.locator('.net-card:visible')).toHaveCount(1);
  await page.locator('.pin:visible').first().click();
  await expect(page.locator('.net-card.on')).toHaveCount(1);
});

test('galeri: filtre ve büyük önizleme', async ({ page }) => {
  await page.goto('/galeri/');
  expect(await page.locator('.gal-item:visible').count()).toBeGreaterThan(8);
  await page.locator('.gal-filter button', { hasText: 'Tanker' }).click();
  const items = page.locator('.gal-item:visible');
  await expect(items).toHaveCount(2);
  await items.first().click();
  await expect(page.locator('dialog.lightbox')).toBeVisible();
  await expect(page.locator('.lightbox figcaption span').first()).toHaveText('01 / 02');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.lightbox figcaption span').first()).toHaveText('02 / 02');
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.lightbox')).toBeHidden();
});

test('indirme merkezi ve şartname', async ({ page }) => {
  await page.goto('/indir/');
  await expect(page.locator('.doc')).toHaveCount(12);
  await page.goto('/sartname/?tip=kasa&L=12&dingil=4');
  await expect(page.locator('.sheet-rows')).toContainText('12,0 m');
  await expect(page.locator('.sheet-rows')).toContainText('4, BPW');
  await expect(page.locator('.sheet h2')).toHaveText('Kapalı Kasa Treyler');
});

test('teklif formu: doğrulama, B2B alanları, ön doldurma', async ({ page }) => {
  await page.goto('/iletisim/?tip=tanker&uzunluk=12,0&dingil=4&renk=Beyaz#teklif');
  await expect(page.locator('#q-tip')).toHaveValue('tanker');
  await expect(page.locator('#q-msg')).toHaveValue(/Yapılandırma: 12,0 m, 4 dingil, renk: Beyaz/);
  for (const id of ['#q-firma', '#q-vergi', '#q-adet', '#q-bolge', '#q-fin']) await expect(page.locator(id)).toBeVisible();
  await page.locator('.qform button[type=submit]').click();
  await expect(page.locator('.qform .err:not(:empty)')).toHaveCount(3); // ad, telefon/e-posta, KVKK onayı
  await expect(page.locator('.consent .err')).toContainText('aydınlatma');
  await expect(page.locator('#q-ad')).toHaveAttribute('aria-invalid', 'true');
});

test('EN: dil geçişi aynı sayfanın İngilizcesine götürür', async ({ page }) => {
  await page.goto('/urun/tanker/');
  await page.locator('a.lang').click();
  await expect(page).toHaveURL(/\/en\/urun\/tanker\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.locator('a.lang').click();
  await expect(page).toHaveURL(/\/urun\/tanker\/$/);
});

test('KVKK: aydınlatma sayfası, form onay kutusu ve alt bilgi bağlantısı', async ({ page }) => {
  await page.goto('/iletisim/');
  await expect(page.locator('.consent a')).toHaveAttribute('href', '/gizlilik/');
  await page.goto('/gizlilik/');
  await expect(page.locator('h1')).toHaveText('Gizlilik ve KVKK');
  await expect(page.locator('.story h2')).toHaveCount(8);
  await expect(page.locator('.story')).toContainText('info@ornek.com'); // site.ts'ten doldurulur
  await expect(page.locator('.story')).toContainText('çerez kullanmaz'); // ölçüm kapalıyken
  await expect(page.locator('.foot-wrap a[href="/gizlilik/"]')).toBeVisible();
  await page.goto('/en/gizlilik/');
  await expect(page.locator('h1')).toHaveText('Privacy and data protection');
});

test('teklif formu: onay + geçerli alanlarla gönderim mailto açar (uç nokta yokken)', async ({ page }) => {
  await page.goto('/iletisim/?tip=tanker');
  await page.fill('#q-ad', 'Test Kişi');
  await page.fill('#q-tel', '5551112233');
  await page.locator('.consent input').check();
  await page.route('mailto:**', (r) => r.abort()).catch(() => {});
  await page.locator('.qform button[type=submit]').click();
  await expect(page.locator('.qform .err:not(:empty)')).toHaveCount(0);
  await expect(page.locator('.ok')).toBeVisible();
});
