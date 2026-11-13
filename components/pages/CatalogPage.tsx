import '@/app/katalog.css';
import BodyClass from '@/components/BodyClass';
import PageHead from '@/components/PageHead';
import PrintButton from '@/components/catalog/PrintButton';
import { ABOUT } from '@/content/pages';
import { STATS } from '@/content/home';
import { PRODUCTS, SITE } from '@/content/site';
import { CONTACT } from '@/content/pages';
import { makeT, type Lang } from '@/lib/i18n';

const pad = (n: number) => String(n).padStart(2, '0');

// Katalog sayfaları content/ verisinden üretilir; PDF aynı sayfanın yazdırılmış halidir (npm run catalog)
export default function CatalogPage({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const total = PRODUCTS.length + 3;
  const foot = (n: number) => <footer className="sheet-foot"><span>{SITE.ad}</span><span>{t('Ürün kataloğu')}</span><span>{pad(n)} / {pad(total)}</span></footer>;
  const [n1, n2] = [SITE.ad.split(' ')[0], SITE.ad.split(' ').slice(1).join(' ')];
  return (
    <main>
      <BodyClass name="inner catalog-page" />
      <PageHead lang={lang} title="Katalog" className="no-print" lead="Altı ürün ailesi, teknik değerler ve iletişim bilgileri tek dosyada. Aşağıda sayfaları önizleyebilir, PDF olarak indirebilirsiniz.">
        <div className="cta">
          <a className="btn" href={`/katalog/${SITE.slug}-katalog-${lang}.pdf`} download>{t('PDF indir')}</a>
          <PrintButton label={t('Yazdır')} />
        </div>
      </PageHead>
      <section className="band tight sheets-wrap">
        <div className="sheets" data-catalog="ready">
          <article className="sheet cover">
            <p className="kicker">{t('Ürün kataloğu')} · 2026</p>
            <h2>{n1}<br />{n2}</h2>
            <img src="/img/hero-rig.png" alt="" width={2000} height={1100} />
            <p className="lead">{t('Düz platform, tenteli, tanker, lowbed, damper ve kapalı kasa treyler üretimi.')}</p>
            <div className="cover-foot"><span>{SITE.telefon}</span><span>{SITE.eposta}</span></div>
          </article>
          <article className="sheet">
            <p className="kicker">{t('Hakkımızda')}</p>
            <h2>{t(ABOUT.title)}</h2>
            <p className="lead">{t(ABOUT.lead)}</p>
            <div className="sheet-stats">{STATS.map(([n, l]) => <div key={l}><strong>{t(n)}</strong><span>{t(l)}</span></div>)}</div>
            <h3>{t('Ürün aileleri')}</h3>
            <ol className="sheet-index">{PRODUCTS.map((p, i) => <li key={p.slug}><b>{pad(i + 3)}</b><span>{t(p.ad)}</span><i>{t(p.meta)}</i></li>)}</ol>
            {foot(2)}
          </article>
          {PRODUCTS.map((p, i) => (
            <article className="sheet product" key={p.slug}>
              <p className="kicker">{pad(i + 1)} · <span>{t(p.kullanim)}</span></p>
              <h2>{t(p.ad)}</h2>
              <div className="sheet-img"><img src={`/img/${p.slug}.png`} alt={t(p.ad)} width={1200} height={800} /></div>
              <p className="lead">{t(p.aciklama)}</p>
              <div className="sheet-specs">{p.gruplar.map(([b, rows]) => <div key={b}><h3>{t(b)}</h3><dl>{rows.map(([k, v]) => <div key={k}><dt>{t(k)}</dt><dd>{t(v)}</dd></div>)}</dl></div>)}</div>
              <ul className="sheet-list">{p.ozellikler.map((o) => <li key={o}>{t(o)}</li>)}</ul>
              {foot(i + 3)}
            </article>
          ))}
          <article className="sheet back">
            <p className="kicker">{t('İletişim')}</p>
            <h2>{t('Teklifinizi hazırlayalım.')}</h2>
            <p className="lead">{t(CONTACT.lead)}</p>
            <dl className="sheet-contact">
              <div><dt>{t('Telefon')}</dt><dd>{SITE.telefon}</dd></div>
              <div><dt>{t('E-posta')}</dt><dd>{SITE.eposta}</dd></div>
              <div><dt>{t('Adres')}</dt><dd translate="no">{SITE.adres}</dd></div>
              <div><dt>{t('Çalışma saatleri')}</dt><dd>{t(SITE.saatler)}</dd></div>
            </dl>
            <p className="small">{t('Değerler şablon örneğidir, siparişe göre değişir.')}</p>
            {foot(total)}
          </article>
        </div>
      </section>
    </main>
  );
}
