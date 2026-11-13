import type { MetadataRoute } from 'next';
import { PRODUCTS, SITE } from '@/content/site';

export const dynamic = 'force-static'; // statik çıktı (output: 'export') için gerekli
const PAGES = ['/', '/kurumsal/', '/urunler/', '/galeri/', '/katalog/', '/satis-sonrasi/', '/servis-agi/', '/indir/', '/iletisim/', '/gizlilik/'];

// Her adres TR ve EN karşılığıyla birlikte (hreflang alternatifleri)
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...PAGES, ...PRODUCTS.map((p) => `/urun/${p.slug}/`)];
  return paths.flatMap((p) => ['', '/en'].map((pre) => ({
    url: `${SITE.url}${pre}${p}`, lastModified: new Date(), priority: p === '/' ? 1 : 0.7,
    alternates: { languages: { tr: `${SITE.url}${p}`, en: `${SITE.url}/en${p}` } },
  })));
}
