import '@/app/katalog.css';
import BodyClass from '@/components/BodyClass';
import PageHead from '@/components/PageHead';
import SpecSheet from '@/components/SpecSheet';
import type { Lang } from '@/lib/i18n';

export default function SpecSheetPage({ lang = 'tr' }: { lang?: Lang }) {
  return (
    <main>
      <BodyClass name="inner catalog-page" />
      <PageHead lang={lang} title="Teknik şartname" className="no-print" lead="Seçtiğiniz yapılandırmanın özeti. Yazdır düğmesiyle PDF olarak kaydedebilirsiniz." />
      <section className="band tight sheets-wrap"><div className="sheets one"><SpecSheet lang={lang} /></div></section>
    </main>
  );
}
