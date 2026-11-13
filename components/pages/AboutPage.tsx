import BodyClass from '@/components/BodyClass';
import CtaBand from '@/components/CtaBand';
import PageHead from '@/components/PageHead';
import { CERTS, FACTORY, RND } from '@/content/b2b';
import { STATS } from '@/content/home';
import { ABOUT } from '@/content/pages';
import { href, makeT, type Lang } from '@/lib/i18n';

export default function AboutPage({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  return (
    <main>
      <BodyClass name="inner" />
      <PageHead lang={lang} title="Kurumsal" lead={ABOUT.lead} className="about-head" />
      <section className="band tight story">
        <div className="reveal">
          <h2>{t('Biz kimiz')}</h2>
          {ABOUT.story.map((p) => <p key={p}>{t(p)}</p>)}
        </div>
        <div className="stat-col reveal">{STATS.slice(0, 3).map(([n, l]) => <div key={l}><strong>{t(n)}</strong><span>{t(l)}</span></div>)}</div>
      </section>
      <section className="band tight">
        <h2 className="reveal">{t('Değerlerimiz')}</h2>
        <div className="why-list reveal">{ABOUT.values.map(([h, p]) => <div key={h}><h3>{t(h)}</h3><p>{t(p)}</p></div>)}</div>
      </section>
      <section className="band tight alt">
        <h2 className="reveal">{t('Fabrika ve üretim teknolojisi')}</h2>
        <div className="steps reveal">{FACTORY.map(([b, d]) => <div key={b}><b>{t(b)}</b><p>{t(d)}</p></div>)}</div>
      </section>
      <section className="band tight">
        <h2 className="reveal">{t('Ar-Ge ve inovasyon')}</h2>
        <div className="grid3 reveal">{RND.map(([b, d]) => <div className="spec-group" key={b}><h3>{t(b)}</h3><p>{t(d)}</p></div>)}</div>
      </section>
      <section className="band tight alt">
        <h2 className="reveal">{t('Sertifikalar')}</h2>
        <div className="doc-list reveal">
          {CERTS.map(([ad, d, f]) => <a key={ad} className="doc" href={f || `${href(lang, '/iletisim/')}#teklif`} {...(f ? { download: true } : {})}><b>{t(ad)}</b><span>{t(d)}</span></a>)}
        </div>
        <p className="small">{t('Belgeler şablon örneğidir. Güncel kopyalar talep üzerine gönderilir.')}</p>
      </section>
      <CtaBand lang={lang} title="Treylerinizi birlikte tasarlayalım." second={['Ürünleri incele', '/urunler/']} />
    </main>
  );
}
