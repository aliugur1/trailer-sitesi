'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { EXTRA, FILTERS } from '@/content/b2b';
import { PRODUCTS, type Product } from '@/content/site';
import { href, makeT, type Lang } from '@/lib/i18n';

type Sel = Record<string, Set<string | number>>;
const match = (p: Product, sel: Sel) => Object.entries(sel).every(([k, vals]) => {
  if (!vals.size) return true;
  const v = (EXTRA[p.slug as keyof typeof EXTRA].filtre as Record<string, string | number>)[k];
  if (k === 'kapasite') return [...vals].some((lim) => (lim === 30 ? +v <= 30 : lim === 40 ? +v > 30 && +v <= 40 : +v > 40));
  if (k === 'dingil') return [...vals].some((n) => (n === 4 ? +v >= 4 : v === n));
  return vals.has(v);
});

// Ürün listesi: teknik filtre paneli, kartta üç değer, karşılaştırma (en çok üç ürün)
export default function Listing({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const [sel, setSel] = useState<Sel>(() => Object.fromEntries(Object.keys(FILTERS).map((k) => [k, new Set()])));
  const [cmp, setCmp] = useState<string[]>([]);
  const dlg = useRef<HTMLDialogElement>(null);
  const shown = PRODUCTS.filter((p) => match(p, sel));

  const toggle = (k: string, v: string | number, on: boolean) => setSel((s) => {
    const n = new Set(s[k]); on ? n.add(v) : n.delete(v);
    return { ...s, [k]: n };
  });
  const cmpProducts = PRODUCTS.filter((p) => cmp.includes(p.slug));
  const rows = new Map<string, string[]>();
  cmpProducts.forEach((p, i) => [...p.gruplar.flatMap(([, r]) => r), ...EXTRA[p.slug as keyof typeof EXTRA].uc].forEach(([k, v]) => { if (!rows.has(k)) rows.set(k, []); rows.get(k)![i] = v; }));

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    const onClick = (e: MouseEvent) => { if (e.target === d) d.close(); };
    d.addEventListener('click', onClick);
    return () => d.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="listing">
      <aside className="filters" aria-label={t('Filtreler')}>
        {Object.entries(FILTERS).map(([k, f]) => (
          <fieldset key={k}><legend>{t(f.label)}</legend>
            {(f.options as [string | number, string][]).map(([v, l]) => (
              <label key={v}><input type="checkbox" checked={sel[k].has(v)} onChange={(e) => toggle(k, v, e.target.checked)} /><span>{t(l)}</span></label>
            ))}
          </fieldset>
        ))}
        <button type="button" className="btn ghost" onClick={() => setSel(Object.fromEntries(Object.keys(FILTERS).map((k) => [k, new Set()])))}>{t('Filtreyi temizle')}</button>
      </aside>
      <div>
        <p className="small" aria-live="polite">{shown.length} {t('ürün')}</p>
        <div className="list-grid">
          {PRODUCTS.map((p) => {
            const e = EXTRA[p.slug as keyof typeof EXTRA];
            const to = href(lang, `/urun/${p.slug}/`);
            return (
              <article key={p.slug} className="pcard lcard" hidden={!shown.includes(p)}>
                <Link href={to}><img src={`/img/${p.slug}.webp`} alt={t(p.ad)} width={1200} height={800} loading="lazy" /></Link>
                <div className="pcard-body">
                  <p className="code">{e.kod}</p>
                  <h3><Link href={to}>{t(p.ad)}</Link></h3>
                  <dl className="three">{e.uc.map(([k, v]) => <div key={k}><dt>{t(k)}</dt><dd>{t(v)}</dd></div>)}</dl>
                  <div className="lcard-foot"><Link className="more" href={to}>{t('İncele')}</Link>
                    <label className="cmp"><input type="checkbox" checked={cmp.includes(p.slug)} disabled={!cmp.includes(p.slug) && cmp.length >= 3}
                      onChange={(ev) => setCmp(ev.target.checked ? [...cmp, p.slug] : cmp.filter((s) => s !== p.slug))} /><span>{t('Karşılaştır')}</span></label></div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="empty" hidden={shown.length > 0}>{t('Bu filtrelere uyan ürün yok.')}</p>
      </div>
      <div className="cmp-bar" hidden={cmp.length < 2}><span>{cmp.length} {t('ürün seçildi')}</span><button type="button" className="btn" onClick={() => dlg.current?.showModal()}>{t('Karşılaştır')}</button></div>
      <dialog ref={dlg} className="cmp-dialog" aria-label={t('Ürün karşılaştırma')}>
        <div className="cmp-head"><h3>{t('Karşılaştırma')}</h3><button type="button" className="lb-btn" aria-label={t('Kapat')} onClick={() => dlg.current?.close()}>×</button></div>
        <div className="cmp-scroll">
          <table><thead><tr><th></th>{cmpProducts.map((p) => <th key={p.slug}>{t(p.ad)}<small>{EXTRA[p.slug as keyof typeof EXTRA].kod}</small></th>)}</tr></thead>
            <tbody>{[...rows].map(([k, v]) => <tr key={k}><th>{t(k)}</th>{cmpProducts.map((p, i) => <td key={p.slug}>{t(v[i] ?? '·')}</td>)}</tr>)}</tbody></table>
        </div>
      </dialog>
    </div>
  );
}
