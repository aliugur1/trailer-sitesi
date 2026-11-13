import BodyClass from '@/components/BodyClass';
import PageHead from '@/components/PageHead';
import { DOWNLOADS } from '@/content/b2b';
import { PRODUCTS } from '@/content/site';
import { href, makeT, type Lang } from '@/lib/i18n';

export default function DownloadsPage({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const items = [...DOWNLOADS, ...PRODUCTS.map((p) => ({ grup: 'Teknik şartnameler', ad: p.ad, tur: 'PDF', dosya: `${href(lang, '/sartname/')}?tip=${p.slug}` }))];
  const groups = [...new Set(items.map((d) => d.grup))];
  return (
    <main>
      <BodyClass name="inner" />
      <PageHead lang={lang} title="İndirme merkezi" lead="Kataloglar, teknik şartnameler, logo ve basın görselleri tek yerde." />
      <section className="band tight">
        {groups.map((g) => (
          <div key={g}>
            <h2>{t(g)}</h2>
            <div className="doc-list">
              {items.filter((d) => d.grup === g).map((d) => <a key={d.dosya} className="doc" href={d.dosya} {...(d.dosya.includes('sartname') ? {} : { download: true })}><b>{t(d.ad)}</b><span>{d.tur}</span></a>)}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
