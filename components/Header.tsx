'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PRODUCTS, SITE } from '@/content/site';
import { href, makeT, switchPath, type Lang } from '@/lib/i18n';

const LINKS: [string, string][] = [['Kurumsal', '/kurumsal/'], ['Ürünler', '/urunler/'], ['Galeri', '/galeri/'], ['Servis', '/satis-sonrasi/'], ['İletişim', '/iletisim/']];

export default function Header({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const low = (s: string) => t(s).toLocaleLowerCase(lang);
  const path = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(true);
  const [img, setImg] = useState(PRODUCTS[0].slug);
  const other: Lang = lang === 'tr' ? 'en' : 'tr';
  const cur = (h: string) => (path.replace(/\/$/, '') === href(lang, h).replace(/\/$/, '') ? 'page' : undefined);

  // Menü zemini ve sabit butonlar: ana sayfada .hero-end, hikâye sayfasında .after geçilince
  useEffect(() => {
    setOpen(false);
    const marker = document.querySelector('.after') || document.querySelector('.hero-end');
    document.body.classList.toggle('past-story', !marker);
    if (!marker) { setSolid(true); return; }
    setSolid(false);
    const io = new IntersectionObserver(([e]) => {
      const past = e.boundingClientRect.top < 72;
      setSolid(past);
      document.body.classList.toggle('past-story', past);
    }, { rootMargin: '-72px 0px 0px 0px', threshold: [0, 1] });
    io.observe(marker);
    return () => io.disconnect();
  }, [path]);

  return (
    <header className={`nav${solid ? ' solid' : ''}${open ? ' open' : ''}`}>
      <Link className="mark" href={href(lang, '/')} ><span aria-hidden="true">{SITE.isaret}</span><span className="sr">{SITE.ad}</span></Link>
      <div className="pillnav">
        <nav className="menu" id="menu" aria-label={t('Ana menü')}>
          {LINKS.map(([name, h]) => h === '/urunler/' ? (
            <div className="has-sub" key={h}>
              <Link href={href(lang, h)} aria-current={cur(h)}>{low(name)}</Link>
              <div className="mega dark">
                <div className="mega-intro">
                  <h3>{t('Ürünler')}</h3><p>{t('Altı ana tip. Hepsini 3D olarak gezip döndürebilirsiniz.')}</p>
                  <Link className="more" href={href(lang, '/urunler/')}>{t('3D tura çık')}</Link>
                  <Link className="more" href={href(lang, '/katalog/')}>{t('Katalog (PDF)')}</Link>
                </div>
                <div className="mega-list">
                  {PRODUCTS.map((p) => (
                    <Link key={p.slug} href={href(lang, `/urun/${p.slug}/`)} onMouseEnter={() => setImg(p.slug)}><b>{t(p.ad)}</b><span>{t(p.ozet)}</span></Link>
                  ))}
                </div>
                <div className="mega-img"><img src={`/img/${img}.webp`} alt="" width={600} height={400} /></div>
              </div>
            </div>
          ) : <Link key={h} href={href(lang, h)} aria-current={cur(h)}>{low(name)}</Link>)}
          <a className="menu-tel" href={`tel:${SITE.tel}`}>{SITE.telefon}</a>
          <a className="menu-tel" href={`https://wa.me/${SITE.whatsapp}`} rel="noopener">WhatsApp</a>
        </nav>
        <a className="tel" href={`tel:${SITE.tel}`}>{SITE.telefon}</a>
        <Link className="lang" href={switchPath(lang, path, other)} hrefLang={other} lang={other} aria-label={other === 'en' ? 'EN, English' : 'TR, Türkçe'}>{other.toUpperCase()}</Link>
        <Link className="nav-cta" href={`${href(lang, '/iletisim/')}#teklif`}>{low('Teklif Al')}</Link>
      </div>
      <button className="burger" type="button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>{low('Menü')}</button>
    </header>
  );
}
