import type { Metadata, Viewport } from 'next';
import { SITE } from '@/content/site';
import { href, makeT, type Lang } from './i18n';

export const viewport: Viewport = { themeColor: '#07090d', viewportFit: 'cover' };
const LOCALE = { tr: 'tr_TR', en: 'en_US' };

// Kök yerleşim metadata'sı (dil başına)
export const rootMeta = (lang: Lang): Metadata => {
  const t = makeT(lang);
  return {
    metadataBase: new URL(SITE.url),
    title: { default: SITE.ad, template: `%s | ${SITE.ad}` },
    description: t('Düz platform, tenteli, tanker, lowbed, damper ve kapalı kasa treyler üretimi.'),
    openGraph: { siteName: SITE.ad, locale: LOCALE[lang], type: 'website', images: ['/og.png'] },
    twitter: { card: 'summary_large_image' },
  };
};

// Sayfa metadata'sı: canonical + TR/EN alternatifleri + paylaşım görseli
export const pageMeta = (lang: Lang, path: string, title: string, desc: string, opts: { absolute?: boolean; image?: string } = {}): Metadata => {
  const t = makeT(lang);
  const ti = t(title), de = t(desc);
  return {
    title: opts.absolute ? { absolute: `${SITE.ad} | ${ti}` } : ti,
    description: de,
    alternates: { canonical: href(lang, path), languages: { tr: href('tr', path), en: href('en', path), 'x-default': href('tr', path) } },
    // görsel verilmezse marka kartı (/og.png, content/site.ts'ten üretilir)
    openGraph: { title: ti, description: de, images: [opts.image ?? '/og.png'] },
  };
};
