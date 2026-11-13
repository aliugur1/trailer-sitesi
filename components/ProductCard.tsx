import Link from 'next/link';
import type { Product } from '@/content/site';
import { href, makeT, type Lang } from '@/lib/i18n';

export default function ProductCard({ p, lang = 'tr', hidden = false }: { p: Product; lang?: Lang; hidden?: boolean }) {
  const t = makeT(lang);
  return (
    <Link className="pcard" hidden={hidden} href={href(lang, `/urun/${p.slug}/`)}>
      <img src={`/img/${p.slug}.webp`} alt={t(p.ad)} width={1200} height={800} loading="lazy" />
      <div className="pcard-body">
        <p className="code">{t(p.meta)}</p>
        <h3>{t(p.ad)}</h3>
        <p>{t(p.ozet)}</p>
        <span className="more">{t('İncele')}</span>
      </div>
    </Link>
  );
}
