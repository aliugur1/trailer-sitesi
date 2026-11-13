'use client';
import { useEffect, useRef, useState } from 'react';
import { GALLERY, GALLERY_TAGS } from '@/content/gallery';
import { makeT, type Lang } from '@/lib/i18n';

const pad = (n: number) => String(n).padStart(2, '0');

// Filtreli galeri ve büyük önizleme (<dialog>); ürün sayfasından ?tip= ile filtreli açılır
export default function Gallery({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const [tag, setTag] = useState('tum');
  const [at, setAt] = useState(0);
  const box = useRef<HTMLDialogElement>(null);
  const shown = GALLERY.map((g, i) => ({ g, i })).filter(({ g }) => tag === 'tum' || g.tip === tag);

  useEffect(() => {
    const tip = new URLSearchParams(location.search).get('tip');
    if (tip && GALLERY_TAGS.some(([k]) => k === tip)) setTag(tip);
  }, []);

  const step = (d: number) => setAt((a) => (a + d + shown.length) % shown.length);
  const cur = shown[at]?.g;
  return (
    <>
      <div className="chips gal-filter" role="group" aria-label={t('Galeri filtresi')}>
        {GALLERY_TAGS.map(([k, l]) => <button key={k} type="button" aria-pressed={tag === k} onClick={() => setTag(k)}>{t(l)}</button>)}
      </div>
      <div className="gal-grid">
        {GALLERY.map((g, i) => (
          <button key={g.src} type="button" className="gal-item" hidden={!(tag === 'tum' || g.tip === tag)} onClick={() => { setAt(shown.findIndex((x) => x.i === i)); box.current?.showModal(); }}>
            <img src={`/img/galeri/${g.src}`} alt={t(g.baslik)} width={1600} height={1000} loading="lazy" decoding="async" />
            <span className="gal-cap"><b>{pad(i + 1)}</b><span>{t(g.baslik)}</span></span>
          </button>
        ))}
      </div>
      <dialog ref={box} className="lightbox" aria-label={t('Görsel önizleme')}
        onClick={(e) => { if (e.target === box.current) box.current?.close(); }}
        onKeyDown={(e) => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); }}>
        <figure>
          {cur && <img src={`/img/galeri/${cur.src}`} alt={t(cur.baslik)} />}
          <figcaption><span>{pad(at + 1)} / {pad(shown.length)}</span><span>{cur && t(cur.baslik)}</span></figcaption>
        </figure>
        <button type="button" className="lb-btn lb-prev" aria-label={t('Önceki görsel')} onClick={() => step(-1)}>←</button>
        <button type="button" className="lb-btn lb-next" aria-label={t('Sonraki görsel')} onClick={() => step(1)}>→</button>
        <button type="button" className="lb-btn lb-close" aria-label={t('Kapat')} onClick={() => box.current?.close()}>×</button>
      </dialog>
    </>
  );
}
