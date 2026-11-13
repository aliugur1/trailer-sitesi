import { SITE, type Product } from '@/content/site';
import { href, makeT, type Lang } from './i18n';

// Yapısal veri (schema.org). Fiyat verilmediği için Product'ta teklif (offers) yazılmaz.
const abs = (path: string) => `${SITE.url}${path}`;

export const orgSchema = (lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.ad,
  url: abs(href(lang, '/')),
  logo: abs('/img/logo.svg'),
  telephone: SITE.tel,
  email: SITE.eposta,
  address: { '@type': 'PostalAddress', streetAddress: SITE.adres },
  contactPoint: [
    { '@type': 'ContactPoint', telephone: SITE.tel, contactType: 'sales', availableLanguage: ['tr', 'en'] },
    { '@type': 'ContactPoint', telephone: SITE.ihracatTel, contactType: 'export sales', availableLanguage: ['tr', 'en'] },
  ],
  ...(SITE.sosyal.length ? { sameAs: SITE.sosyal.map(([, u]) => u) } : {}),
});

export const productSchema = (p: Product, kod: string, lang: Lang) => {
  const t = makeT(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: t(p.ad),
    description: t(p.aciklama),
    image: abs(`/img/${p.slug}.png`),
    sku: kod,
    category: 'Trailer',
    url: abs(href(lang, `/urun/${p.slug}/`)),
    brand: { '@type': 'Brand', name: SITE.ad },
    manufacturer: { '@type': 'Organization', name: SITE.ad },
  };
};

export const breadcrumbSchema = (lang: Lang, items: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(href(lang, path)) })),
});
