import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';

export const dynamic = 'force-static'; // statik çıktı (output: 'export') için gerekli

// Şartname sayfası yapılandırmaya bağlı yazdırma çıktısıdır, dizinlenmez
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/sartname/', '/en/sartname/'] }], sitemap: `${SITE.url}/sitemap.xml`, host: SITE.url };
}
