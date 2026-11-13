import en from '@/content/i18n/en';

// Kaynak dil Türkçe. Diğer diller content/i18n/<dil>.ts içinde "Türkçe metin": "çeviri" sözlüğüdür.
// Sözlükte olmayan metin Türkçe kalır (eksik çeviri testle yakalanır).
export type Lang = 'tr' | 'en';
export const LANGS: Lang[] = ['tr', 'en'];
const DICTS: Record<string, Record<string, string>> = { en };
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

// yalnızca sayı ve birim içeren metin (13,6 m · 36.000 L): İngilizcede ondalık ve binlik ayırıcı yer değiştirir
const NUMERIC = /^\d[\d.,]*\+?\s?(m|t|L|m³|m²|kg|mm|km)?$/;
export const makeT = (lang: Lang) => {
  const d = DICTS[lang];
  return (s: string) => {
    const k = norm(s);
    return d?.[k] ?? (lang === 'en' && NUMERIC.test(k) ? k.replace(/[.,]/g, (c) => (c === ',' ? '.' : ',')) : s);
  };
};
export const makeNum = (lang: Lang) => (n: number, digits = 1) =>
  n.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

// Dile göre adres: Türkçe kökte, diğer diller /<dil>/ altında
export const href = (lang: Lang, path: string) => (lang === 'tr' ? path : `/${lang}${path === '/' ? '/' : path}`);
export const switchPath = (lang: Lang, pathname: string, to: Lang) => {
  const base = lang === 'tr' ? pathname : pathname.replace(new RegExp(`^/${lang}(?=/|$)`), '') || '/';
  return href(to, base);
};
