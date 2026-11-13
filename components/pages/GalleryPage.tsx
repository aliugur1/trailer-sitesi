import BodyClass from '@/components/BodyClass';
import CtaBand from '@/components/CtaBand';
import Gallery from '@/components/Gallery';
import PageHead from '@/components/PageHead';
import type { Lang } from '@/lib/i18n';

export default function GalleryPage({ lang = 'tr' }: { lang?: Lang }) {
  return (
    <main>
      <BodyClass name="inner" />
      <PageHead lang={lang} title="Galeri" lead="Ürün aileleri ve yakın plan detaylar. Görseller şablon amaçlı 3D sahneden üretilmiştir." />
      <section className="band tight"><Gallery lang={lang} /></section>
      <CtaBand lang={lang} title="Hepsi tek katalogda." second={['Katalog (PDF)', '/katalog/']} />
    </main>
  );
}
