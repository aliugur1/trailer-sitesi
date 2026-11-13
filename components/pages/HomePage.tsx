import Link from 'next/link';
import Acts from '@/components/home/Acts';
import ProductFinder from '@/components/home/ProductFinder';
import JsonLd from '@/components/JsonLd';
import QuoteForm from '@/components/QuoteForm';
import { FilmSection, Proof, TrustBar } from '@/components/home/Trust';
import { QUALITY } from '@/content/b2b';
import { FAQ, STATS, STEPS, WHY } from '@/content/home';
import { SITE } from '@/content/site';
import { href, makeT, type Lang } from '@/lib/i18n';
import { orgSchema } from '@/lib/schema';

export default function HomePage({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  return (
    <main>
      <JsonLd data={orgSchema(lang)} />
      <Acts lang={lang} />
      <div className="hero-end" />
      <TrustBar lang={lang} />
      <FilmSection lang={lang} />
      <ProductFinder lang={lang} />

      <div className="after-worlds">
        <section className="band dark stats" id="rakamlar">
          <p className="kicker reveal">{t('Rakamlar')}</p>
          <h2 className="reveal">{t('Üretim gücü sahada görünür.')}</h2>
          <div className="stat-row reveal">{STATS.map(([n, l]) => <div key={l}><strong>{t(n)}</strong><span>{t(l)}</span></div>)}</div>
        </section>

        <section className="band tight quality">
          <p className="kicker reveal">{t('Kalite')}</p>
          <h2 className="reveal">{t('Teknoloji ve kalite.')}</h2>
          <div className="grid3 reveal">{QUALITY.map(([b, d]) => <div className="spec-group" key={b}><h3>{t(b)}</h3><p>{t(d)}</p></div>)}</div>
        </section>

        <section className="band why">
          <div className="why-head">
            <p className="kicker reveal">{t('Neden biz')}</p>
            <h2 className="reveal">{t('Detayda mühendislik, yolda güven.')}</h2>
          </div>
          <div className="why-list reveal">{WHY.map(([h, p]) => <div key={h}><h3>{t(h)}</h3><p>{t(p)}</p></div>)}</div>
        </section>

        <section className="band alt" id="surec">
          <p className="kicker reveal">{t('Süreç')}</p>
          <h2 className="reveal">{t('Fikirden yola, beş adımda.')}</h2>
          <div className="steps reveal">{STEPS.map(([b, p]) => <div key={b}><b>{t(b)}</b><p>{t(p)}</p></div>)}</div>
        </section>

        <section className="band tight net-teaser dark">
          <div>
            <p className="kicker reveal">{t('Servis')}</p>
          <h2 className="reveal">{t('En yakın servisi bulun.')}</h2>
            <p className="lead reveal">{t('Yetkili servisler, satış noktaları ve 7/24 yol yardım.')}</p>
          </div>
          <form className="net-search reveal" action={href(lang, '/servis-agi/')} method="get">
            <label className="sr" htmlFor="net-home-q">{t('Şehir ya da servis adı')}</label>
            <input id="net-home-q" name="q" type="search" placeholder={t('Örnek: Konya')} />
            <button className="btn" type="submit">{t('Servis bul')}</button>
          </form>
        </section>

        <Proof lang={lang} />

        <section className="callband">
          <p className="reveal">{t('hızlı teklif için arayın')}</p>
          <a className="bigphone reveal" href={`tel:${SITE.tel}`}>{SITE.telefon}</a>
          <a className="btn reveal" href={`https://wa.me/${SITE.whatsapp}`} rel="noopener">{t('whatsapp ile yazın')} →</a>
        </section>

        <section className="band faq">
          <h2 className="reveal">{t('Sık sorulanlar')}</h2>
          <div className="faq-list reveal">{FAQ.map(([q, a]) => <details key={q}><summary>{t(q)}</summary><p>{t(a)}</p></details>)}</div>
        </section>

        <section className="band quote alt" id="teklif">
          <div>
            <h2 className="reveal">{t('Teklifinizi hazırlayalım.')}</h2>
            <p className="lead reveal">{t('Formu doldurun, ekibimiz iş günü içinde sizi arasın.')}</p>
          </div>
          <div className="reveal"><QuoteForm lang={lang} /></div>
        </section>
      </div>
    </main>
  );
}
