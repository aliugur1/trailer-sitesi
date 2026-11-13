'use client';
import { useEffect, useRef, useState } from 'react';
import { DEALERS, DEALER_TYPES } from '@/content/b2b';
import { makeT, type Lang } from '@/lib/i18n';

const fold = (s: string) => s.toLocaleLowerCase('tr');
const TYPE_LABEL = Object.fromEntries(DEALER_TYPES as [string, string][]);

// Şematik harita (yüzde konumlu noktalar) + liste. Gerçek harita servisi bağlanınca harita bloğu değişir.
export default function DealerNetwork({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const [type, setType] = useState('tum');
  const [query, setQuery] = useState('');
  const [on, setOn] = useState<number | null>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(new URLSearchParams(location.search).get('q') ?? ''); }, []);

  const shown = DEALERS.map((d, i) => (type === 'tum' || d.tur === type) && fold(`${d.ad} ${d.sehir}`).includes(fold(query.trim())));
  const pick = (i: number) => {
    setOn(i);
    list.current?.querySelector(`.net-card[data-i="${i}"]`)?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  return (
    <>
      <div className="net-tools">
        <div className="field"><label htmlFor="net-q">{t('Şehir ya da servis adı')}</label>
          <input id="net-q" type="search" placeholder={t('Örnek: Konya')} value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="chips gal-filter" role="group" aria-label={t('Nokta türü')}>
          {(DEALER_TYPES as [string, string][]).map(([k, l]) => <button key={k} type="button" aria-pressed={type === k} onClick={() => setType(k)}>{t(l)}</button>)}
        </div>
      </div>
      <div className="net">
        <div className="net-map" aria-label={t('Şematik servis haritası')}>
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={(i + 1) * 10} y1={0} x2={(i + 1) * 10} y2={60} />)}
            {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1={0} y1={(i + 1) * 10} x2={100} y2={(i + 1) * 10} />)}
          </svg>
          {DEALERS.map((d, i) => (
            <button key={d.ad} type="button" className={`pin${on === i ? ' on' : ''}`} data-i={i} data-tur={d.tur} hidden={!shown[i]} style={{ left: `${d.x}%`, top: `${d.y}%` }} aria-label={`${t(d.ad)}, ${t(d.sehir)}`} onClick={() => pick(i)}><span>{t(d.sehir)}</span></button>
          ))}
        </div>
        <div className="net-list" ref={list} aria-live="polite">
          {DEALERS.map((d, i) => (
            <article key={d.ad} className={`net-card${on === i ? ' on' : ''}`} data-i={i} hidden={!shown[i]}>
              <p className="code">{t(TYPE_LABEL[d.tur])}</p><h2 className="net-name">{t(d.ad)}</h2><p>{t(d.adres)}, {t(d.sehir)}</p>
              <div className="cta"><a className="btn ghost" href={`tel:${d.tel.replace(/\s/g, '')}`}>{d.tel}</a>
                <a className="more" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.adres} ${d.sehir}`)}`} rel="noopener" target="_blank">{t('Yol tarifi al')}</a></div>
            </article>
          ))}
          <p className="empty" hidden={shown.some(Boolean)}>{t('Bu aramaya uyan nokta yok.')}</p>
        </div>
      </div>
    </>
  );
}
