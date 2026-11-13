import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Erişilebilirlik: axe (WCAG 2.0/2.1 A ve AA + en iyi uygulamalar) tüm sayfalarda, TR ve EN, masaüstü ve mobil.
// Sıfır ihlal beklenir. WebGL üstündeki metnin kontrastı axe'ın hesaplayamadığı "incomplete" gruba girer, ihlal sayılmaz.
const SLUGS = ['duz', 'tenteli', 'tanker', 'lowbed', 'damper', 'kasa'];
const PATHS = ['/', '/urunler/?skip', '/kurumsal/', '/galeri/', '/katalog/', '/servis-agi/', '/satis-sonrasi/', '/indir/', '/sartname/?tip=lowbed', '/iletisim/', '/gizlilik/', ...SLUGS.map((s) => `/urun/${s}/`)];

for (const lang of ['tr', 'en']) {
  test(`erişilebilirlik (axe) ${lang}: ihlal yok`, async ({ page }) => {
    const found = {};
    for (const p of PATHS) {
      await page.goto(lang === 'en' ? `/en${p}` : p);
      await page.waitForTimeout(600);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
      for (const v of r.violations) (found[p] ??= []).push(`${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0].target.join(' ')}`);
    }
    expect(found, 'axe ihlalleri').toEqual({});
  });
}
