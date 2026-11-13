import Link from 'next/link';
import BodyClass from '@/components/BodyClass';
import Crumbs from '@/components/Crumbs';
import JsonLd from '@/components/JsonLd';
import PdpBar from '@/components/PdpBar';
import ProductCard from '@/components/ProductCard';
import ProductViewer from '@/components/ProductViewer';
import Tabs from '@/components/Tabs';
import { EXTRA, STANDARD } from '@/content/b2b';
import { OPTIONS, TYPES } from '@/content/configurator';
import { GALLERY } from '@/content/gallery';
import { PRODUCTS, SITE, bul } from '@/content/site';
import { sideDrawing, type DrawingSpec } from '@/lib/drawing';
import { href, makeT, type Lang } from '@/lib/i18n';
import { breadcrumbSchema, productSchema } from '@/lib/schema';

export default function ProductPage({ slug, lang = 'tr' }: { slug: string; lang?: Lang }) {
  const t = makeT(lang);
  const L = (p: string) => href(lang, p);
  const p = bul(slug)!;
  const ex = EXTRA[slug as keyof typeof EXTRA];
  const shots = GALLERY.filter((g) => g.tip === slug);
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`${t('Merhaba, şu ürün hakkında bilgi almak istiyorum')}: ${t(p.ad)} (${ex.kod})`)}`;
  const quote = `${L('/iletisim/')}?tip=${p.slug}#teklif`;
  const docs: [string, string, string][] = [
    ['Ürün kataloğu', 'PDF', `/katalog/${SITE.slug}-katalog-${lang}.pdf`],
    ['Teknik şartname', 'PDF', `${L('/sartname/')}?tip=${p.slug}`],
    ['Tip onay belgesi', 'Talep üzerine', `${L('/iletisim/')}#teklif`],
  ];
  return (
    <main>
      <BodyClass name="inner" />
      <JsonLd data={productSchema(p, ex.kod, lang)} />
      <JsonLd data={breadcrumbSchema(lang, [[t('Ana Sayfa'), '/'], [t('Ürünler'), '/urunler/'], [t(p.ad), `/urun/${p.slug}/`]])} />
      <div className="crumb-wrap"><Crumbs lang={lang} items={[['Ürünler', '/urunler/'], [p.ad, '']]} /></div>
      <section className="product-hero">
        <ProductViewer slug={p.slug} label={t('3D ürün görüntüleyici')} />
        <div className="product-info">
          <p className="code">{ex.kod}</p>
          <h1>{t(p.ad)}</h1>
          <p className="lead">{t(p.aciklama)}</p>
          <p className="tags">{p.kullanim.split(', ').map((k) => <span key={k}>{t(k)}</span>)}</p>
          <ul className="list">{p.ozellikler.map((o) => <li key={o}>{t(o)}</li>)}</ul>
          <div className="cta">
            <Link className="btn" href={quote}>{t('Teklif Al')}</Link>
            <a className="btn ghost" href={wa} rel="noopener">{t('WhatsApp ile sorun')}</a>
            <a className="btn ghost" href={`tel:${SITE.tel}`}>{t('Hemen Ara')}</a>
          </div>
          <p className="hint">{t('Sürükleyerek döndürün, tekerlekle yakınlaşın.')}</p>
        </div>
      </section>

      <section className="band tight">
        <h2 className="reveal">{t('Teknik özellikler')}</h2>
        <div className="spec-grid reveal">
          {p.gruplar.map(([b, rows]) => (
            <div className="spec-group" key={b}>
              <h3>{t(b)}</h3>
              <dl>{rows.map(([e, d]) => <div key={e}><dt>{t(e)}</dt><dd>{t(d)}</dd></div>)}</dl>
            </div>
          ))}
        </div>
        <p className="small">{t('Değerler şablon örneğidir, siparişe göre değişir.')}</p>
      </section>

      <section className="band tight alt">
        <h2 className="reveal">{t('Ölçüler')}</h2>
        <div className="drawing-wrap reveal" tabIndex={0} role="region" aria-label={t('Ölçülü yan görünüş')} dangerouslySetInnerHTML={{ __html: sideDrawing(ex.cizim as DrawingSpec, lang) }} />
        <p className="small">{t('Şematik çizimdir, ölçüler metre cinsindendir.')}</p>
      </section>

      <section className="band tight">
        <h2 className="reveal">{t('Ayrıntılı özellikler')}</h2>
        <div className="tabs reveal"><Tabs tabs={(ex.sekmeler as [string, string[][]][]).map(([b, rows]): [string, [string, string][]] => [t(b), rows.map(([k, v]) => [t(k), t(v)])])} /></div>
      </section>

      <section className="band tight alt two-col">
        <div>
          <h2 className="reveal">{t('Standart donanım')}</h2>
          <ul className="list reveal">{STANDARD[slug as keyof typeof STANDARD].map((o) => <li key={o}>{t(o)}</li>)}</ul>
        </div>
        <div>
          <h2 className="reveal">{t('Opsiyonlar')}</h2>
          <ul className="list reveal">{OPTIONS.map((o) => <li key={o.label}>{t(o.label)}</li>)}</ul>
          <Link className="btn ghost" href={slug in TYPES ? `${L('/')}?tip=${slug}#acts` : L('/')}>{t('Yapılandırıcıda aç')}</Link>
        </div>
      </section>

      {shots.length > 0 && (
        <section className="band tight">
          <h2 className="reveal">{t('Görseller')}</h2>
          <div className="gal-strip reveal">
            {shots.map((g) => <Link key={g.src} href={`${L('/galeri/')}?tip=${slug}`}><img src={`/img/galeri/${g.src}`} alt={t(g.baslik)} width={1600} height={1000} loading="lazy" /></Link>)}
          </div>
        </section>
      )}

      <section className="band tight alt">
        <h2 className="reveal">{t('Belgeler')}</h2>
        <div className="doc-list reveal">{docs.map(([ad, tur, h]) => <a className="doc" key={ad} href={h}><b>{t(ad)}</b><span>{t(tur)}</span></a>)}</div>
      </section>

      <section className="band tight">
        <h2 className="reveal">{t('Diğer ürünler')}</h2>
        <div className="grid3 reveal">{PRODUCTS.filter((x) => x.slug !== slug).map((x) => <ProductCard key={x.slug} p={x} lang={lang} />)}</div>
      </section>

      <PdpBar name={`${t(p.ad)} · ${ex.kod}`} contactHref={L('/iletisim/')} quoteHref={quote} contactLabel={t('Satış temsilcisiyle görüşün')} quoteLabel={t('Bu model için Teklif Al')} />
    </main>
  );
}
