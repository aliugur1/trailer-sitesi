import Link from 'next/link';
import BodyClass from '@/components/BodyClass';
import PageHead from '@/components/PageHead';
import VinLookup from '@/components/VinLookup';
import { MAINTENANCE, ROADSIDE } from '@/content/b2b';
import { href, makeT, type Lang } from '@/lib/i18n';

export default function AfterSalesPage({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  return (
    <main>
      <BodyClass name="inner" />
      <PageHead lang={lang} title="Satış sonrası" lead="Yedek parça, bakım ve garanti. Treyler teslim edildikten sonra da yanınızdayız." />
      <section className="band tight alt two-col"><VinLookup lang={lang} /></section>
      <section className="band tight">
        <h2 className="reveal">{t('Bakım aralıkları')}</h2>
        <div className="steps reveal">{MAINTENANCE.map(([b, d]) => <div key={b}><b>{t(b)}</b><p>{t(d)}</p></div>)}</div>
      </section>
      <section className="band tight alt two-col">
        <div>
          <h2 className="reveal">{t('Garanti')}</h2>
          <p className="lead reveal">{t('Şasi ve kaynak yapısı iki yıl üretici garantisi altındadır. Dingil, fren ve elektrik bileşenlerinde tedarikçi garantisi geçerlidir. Kapsam teklifte ve teslim belgesinde yazar.')}</p>
        </div>
        <div>
          <h2 className="reveal">{t('Servis ağı')}</h2>
          <p className="lead reveal">{t('Yetkili servisler ve satış noktaları haritada.')}</p>
          <Link className="btn reveal" href={href(lang, '/servis-agi/')}>{t('Servis bul')}</Link>
        </div>
      </section>
      <section className="callband"><p>{t('7/24 yol yardım')}</p><a className="bigphone" href={ROADSIDE.href}>{ROADSIDE.tel}</a></section>
    </main>
  );
}
