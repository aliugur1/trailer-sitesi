import Link from 'next/link';
import { href, makeT, type Lang } from '@/lib/i18n';

export default function CtaBand({ title, second, lang = 'tr' }: { title: string; second: [string, string]; lang?: Lang }) {
  const t = makeT(lang);
  return (
    <section className="band tight cta-band dark">
      <h2 className="reveal">{t(title)}</h2>
      <div className="cta reveal">
        <Link className="btn" href={`${href(lang, '/iletisim/')}#teklif`}>{t('Teklif Al')}</Link>
        <Link className="btn ghost" href={href(lang, second[1])}>{t(second[0])}</Link>
      </div>
    </section>
  );
}
