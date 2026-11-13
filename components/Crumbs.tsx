import Link from 'next/link';
import { href, makeT, type Lang } from '@/lib/i18n';

export default function Crumbs({ items, lang = 'tr' }: { items: [string, string][]; lang?: Lang }) {
  const t = makeT(lang);
  return (
    <nav className="crumbs" aria-label={t('Kırıntı yolu')}>
      <Link href={href(lang, '/')}>{t('Ana Sayfa')}</Link>
      {items.map(([ad, h]) => (h ? <Link key={h} href={href(lang, h)}>{t(ad)}</Link> : <span key={ad} aria-current="page">{t(ad)}</span>))}
    </nav>
  );
}
