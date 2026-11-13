import BodyClass from '@/components/BodyClass';
import { mapUrl } from '@/components/Footer';
import PageHead from '@/components/PageHead';
import QuoteForm from '@/components/QuoteForm';
import { SALES } from '@/content/b2b';
import { CONTACT } from '@/content/pages';
import { SITE } from '@/content/site';
import { makeT, type Lang } from '@/lib/i18n';

export default function ContactPage({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  return (
    <main>
      <BodyClass name="inner" />
      <PageHead lang={lang} title="İletişim" lead={CONTACT.lead} />
      <section className="band tight quote alt" id="teklif">
        <div className="contact-info">
          <h2>{t('Bize ulaşın')}</h2>
          <dl>
            <div><dt>{t('Telefon')}</dt><dd><a href={`tel:${SITE.tel}`}>{SITE.telefon}</a></dd></div>
            <div><dt>{t('İhracat')}</dt><dd><a href={`tel:${SITE.ihracatTel}`}>{SITE.ihracat}</a></dd></div>
            <div><dt>{t('E-posta')}</dt><dd><a href={`mailto:${SITE.eposta}`}>{SITE.eposta}</a></dd></div>
            <div><dt>{t('Adres')}</dt><dd><span translate="no">{SITE.adres}</span><br /><a className="more" href={mapUrl} rel="noopener" target="_blank">{t('Yol tarifi al')}</a></dd></div>
            <div><dt>{t('Çalışma saatleri')}</dt><dd>{t(SITE.saatler)}</dd></div>
          </dl>
          <h3 className="sub">{t('Bölge satış ekibi')}</h3>
          <dl>{SALES.map(([b, u, tel]) => <div key={b}><dt>{t(b)}</dt><dd><a href={`tel:${tel.replace(/\s/g, '')}`}>{tel}</a><small>{t(u)}</small></dd></div>)}</dl>
        </div>
        <div><QuoteForm lang={lang} /></div>
      </section>
    </main>
  );
}
