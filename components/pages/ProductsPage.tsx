import BodyClass from '@/components/BodyClass';
import Listing from '@/components/Listing';
import Tour from '@/components/Tour';
import { makeT, type Lang } from '@/lib/i18n';

// Sinematik 3D tur + teknik filtreli ürün listesi
export default function ProductsPage({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  return (
    <>
      <BodyClass name="tour" />
      <Tour lang={lang} />
      <section className="after" aria-label={t('Tüm ürünler')}>
        <div className="band">
          <h2 className="reveal">{t('Tüm ürünler')}</h2>
          <p className="lead reveal">{t('Teknik değerlere göre süzün, en çok üç ürünü yan yana karşılaştırın.')}</p>
          <div id="urun-listesi"><Listing lang={lang} /></div>
        </div>
      </section>
    </>
  );
}
