import Link from 'next/link';
import { PRODUCTS, SITE } from '@/content/site';
import { href, makeT, type Lang } from '@/lib/i18n';

export const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.adres)}`;
const [n1, n2] = [SITE.ad.split(' ')[0].toUpperCase(), SITE.ad.split(' ').slice(1).join(' ').toUpperCase()];

export default function Footer({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const L = (p: string) => href(lang, p);
  const col = (title: string, items: [string, string][]) => (
    <div><h3>{t(title)}</h3>{items.map(([name, h]) => <Link key={h + name} href={L(h)}>{t(name)}</Link>)}</div>
  );
  return (
    <footer className="foot-wrap dark">
      <div className="foot-cta">
        <h2>{t('Birlikte tasarlayalım.')}</h2>
        <Link className="btn" href={`${L('/iletisim/')}#teklif`}>{t('Teklif Al')}</Link>
      </div>
      <div className="foot-grid">
        <div>
          <Link className="logo" href={L('/')}>{n1}<b>{n2}</b></Link>
          <p>{t('Düz platform, tenteli, tanker, lowbed, damper ve kapalı kasa treyler üretimi. Yükünüze göre ölçülür, sahada çalışır.')}</p>
        </div>
        {col('Kurumsal', [['Ana Sayfa', '/'], ['Kurumsal', '/kurumsal/'], ['Galeri', '/galeri/'], ['Katalog (PDF)', '/katalog/'], ['İndirme merkezi', '/indir/'], ['Gizlilik ve KVKK', '/gizlilik/']])}
        <div><h3>{t('Ürünler')}</h3>{PRODUCTS.map((p) => <Link key={p.slug} href={L(`/urun/${p.slug}/`)}>{t(p.ad)}</Link>)}<Link href={L('/urunler/')}>{t('Tüm ürünler')}</Link></div>
        {col('Destek', [['Satış sonrası', '/satis-sonrasi/'], ['Servis ağı', '/servis-agi/'], ['Yapılandırıcı', '/#acts'], ['İletişim', '/iletisim/']])}
        <div>
          <h3>{t('İletişim')}</h3>
          <a href={`tel:${SITE.tel}`}>{SITE.telefon}</a>
          <a href={`tel:${SITE.ihracatTel}`}>{SITE.ihracat} <small>{t('İhracat')}</small></a>
          <a href={`mailto:${SITE.eposta}`}>{SITE.eposta}</a>
          <p translate="no">{SITE.adres}</p>
          <a href={mapUrl} rel="noopener" target="_blank">{t('Yol tarifi al')}</a>
          <p>{t(SITE.saatler)}</p>
          {SITE.sosyal.length > 0 && <p className="social">{SITE.sosyal.map(([ad, url]) => <a key={ad} href={url} rel="noopener" target="_blank">{ad}</a>)}</p>}
        </div>
      </div>
      <p className="foot-note">© 2026 {SITE.ad}. {t('Şablon site, içerik örnektir.')}</p>
      <div className="wordmark" aria-hidden="true">{n1}<b>{n2}</b></div>
    </footer>
  );
}
