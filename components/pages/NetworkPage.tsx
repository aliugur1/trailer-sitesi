import BodyClass from '@/components/BodyClass';
import DealerNetwork from '@/components/DealerNetwork';
import PageHead from '@/components/PageHead';
import { ROADSIDE } from '@/content/b2b';
import { makeT, type Lang } from '@/lib/i18n';

export default function NetworkPage({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  return (
    <main>
      <BodyClass name="inner" />
      <PageHead lang={lang} title="Servis ağı" lead="Yetkili servisler ve satış noktaları. Liste ve harita şablon örneğidir." />
      <section className="band tight"><DealerNetwork lang={lang} /></section>
      <section className="callband"><p>{t('7/24 yol yardım')}</p><a className="bigphone" href={ROADSIDE.href}>{ROADSIDE.tel}</a></section>
    </main>
  );
}
