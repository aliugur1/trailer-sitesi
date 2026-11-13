'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EXTRA } from '@/content/b2b';
import { AXLES, AXLE_BRANDS, BRAKES, CAPACITY_KINDS, COLORS, DEFAULTS, LENGTH, OPTIONS, TYPES, byId, colorByHex, computeSpecs, type Config } from '@/content/configurator';
import { SITE, bul } from '@/content/site';
import { sideDrawing, type DrawingSpec } from '@/lib/drawing';
import { href, makeNum, makeT, type Lang } from '@/lib/i18n';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Teknik şartname: ürün sayfasından (?tip=) ya da yapılandırıcıdan (?tip=&L=&dingil=&renk=&marka=&fren=&ops=) açılır
export default function SpecSheet({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang), num = makeNum(lang);
  const [q, setQ] = useState<URLSearchParams | null>(null);
  useEffect(() => setQ(new URLSearchParams(location.search)), []);
  const p = bul(q?.get('tip') ?? '') ?? bul('duz')!;
  const ex = EXTRA[p.slug as keyof typeof EXTRA];
  const configurable = p.slug in TYPES;
  const g = (k: string) => q?.get(k) ?? null;
  const cfg: Config = {
    ...DEFAULTS, type: configurable ? p.slug : 'duz',
    L: clamp(+(g('L') ?? 0) || ex.cizim.L, LENGTH.min, LENGTH.max),
    axles: (AXLES.options as number[]).includes(+(g('dingil') ?? 0)) ? +(g('dingil') as string) : ex.cizim.axles,
    color: colorByHex(+(g('renk') ?? 0)).hex,
    brand: byId(AXLE_BRANDS, g('marka') ?? '').id, brake: byId(BRAKES, g('fren') ?? ex.filtre.fren).id,
    options: (g('ops') ?? '').split(',').filter((id) => OPTIONS.some((o) => o.id === id)),
  };
  const rows: [string, string][] = [[t('Model'), `${t(p.ad)} · ${ex.kod}`]];
  if (configurable) {
    const s = computeSpecs(cfg), kind = CAPACITY_KINDS[s.capacityKind as keyof typeof CAPACITY_KINDS];
    rows.push([t('Uzunluk'), `${num(cfg.L)} m`], [t('Dingil'), `${cfg.axles}, ${t(byId(AXLE_BRANDS, cfg.brand!).label)}`], [t('Fren'), t(byId(BRAKES, cfg.brake!).label)],
      [t('Renk'), t(colorByHex(cfg.color!).label)], [t('Dara'), `${num(s.tare)} t`], [t('Azami yük'), `${num(s.payload)} t`], [t(kind.label), `${num(s.capacity, s.capacityDigits)} ${kind.unit}`],
      [t('Opsiyonlar'), (cfg.options ?? []).map((id) => t(byId(OPTIONS, id).label)).join(', ') || t('Yok')]);
  }
  const drawing = (configurable ? { ...ex.cizim, L: cfg.L, axles: cfg.axles } : ex.cizim) as DrawingSpec;
  const today = new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'tr-TR');
  const tabs = ex.sekmeler as [string, string[][]][];
  return (
    <>
      <article className="sheet spec">
        <p className="kicker">{t('Teknik şartname')} · <span>{today}</span></p>
        <h2>{t(p.ad)}</h2>
        <div className="sheet-draw" dangerouslySetInnerHTML={{ __html: sideDrawing(drawing, lang) }} />
        <dl className="sheet-rows">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <div className="sheet-specs">{tabs.slice(0, 3).map(([b, r]) => <div key={b}><h3>{t(b)}</h3><dl>{r.slice(0, 3).map(([k, v]) => <div key={k}><dt>{t(k)}</dt><dd>{t(v)}</dd></div>)}</dl></div>)}</div>
        <p className="small">{t('Değerler şablon örneğidir, siparişe göre değişir.')}</p>
        <footer className="sheet-foot"><span>{SITE.ad}</span><span>{SITE.telefon}</span><span>{SITE.eposta}</span></footer>
      </article>
      <SheetActions lang={lang} slug={p.slug} />
    </>
  );
}

// yazdırılırken gizlenir (.no-print)
function SheetActions({ lang, slug }: { lang: Lang; slug: string }) {
  const t = makeT(lang);
  return (
    <div className="cta no-print" style={{ marginTop: 24 }}>
      <button className="btn" type="button" onClick={() => print()}>{t('PDF olarak kaydet')}</button>
      <Link className="btn ghost" href={`${href(lang, '/iletisim/')}?tip=${slug}#teklif`}>{t('Teklif Al')}</Link>
    </div>
  );
}
