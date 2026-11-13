'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HERO } from '@/content/home';
import { AXLE_BRANDS, AXLES, BRAKES, CAPACITY_KINDS, COLORS, DEFAULTS, LENGTH, OPTIONS, TYPES, byId, colorByHex, computeSpecs, type Config } from '@/content/configurator';
import { PRODUCTS, SITE } from '@/content/site';
import { href, makeNum, makeT, type Lang } from '@/lib/i18n';

const STEPS = ['Tip', 'Şasi', 'Donanım', 'Özet'];
const hex6 = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
type StageApi = { update(p: number, now?: number): void; setConfig(c: Config): void; setView(v: string): void; dispose(): void };

function Chip({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return <button type="button" aria-pressed={on} onClick={onClick}>{label}</button>;
}

export default function Acts({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang), num = makeNum(lang);
  const L = (p: string) => href(lang, p);
  const [cfg, setCfg] = useState<Config>({ ...DEFAULTS, options: [] });
  const [step, setStep] = useState(1);
  const [view, setView] = useState('3d');
  const [act, setAct] = useState(1);
  const [live, setLive] = useState(false);
  const acts = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const stage = useRef<StageApi | null>(null);
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  const set = (patch: Partial<Config>) => setCfg((c) => ({ ...c, ...patch }));

  // ?tip=tanker ile doğrudan açılış
  useEffect(() => {
    const tip = new URLSearchParams(location.search).get('tip');
    if (tip && tip in TYPES) setCfg((c) => ({ ...c, type: tip }));
  }, []);

  // sahne: yalnızca tarayıcıda yüklenir
  useEffect(() => {
    let off = false, raf = 0;
    const el = acts.current!;
    (async () => {
      try {
        // ağır sahne kurulumu ilk boyamadan sonra, tarayıcı boştayken (ana iş parçacığı etkileşimi engellemesin)
        await new Promise<void>((r) => ('requestIdleCallback' in window ? requestIdleCallback(() => r(), { timeout: 1200 }) : setTimeout(r, 300)));
        if (off) return;
        const { createStage, ACT_EDGES } = await import('@/lib/three/stage');
        if (off) return;
        const s: StageApi = createStage(canvas.current, svg.current, { lang, initial: cfgRef.current, fixedQuality: new URLSearchParams(location.search).has('hq') });
        stage.current = s;
        s.update(0);
        setLive(true);
        let visible = true, lastAct = 0, lastFly = false;
        new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(el);
        const frame = (now: number, pOverride?: number) => {
          const r = el.getBoundingClientRect();
          const p = pOverride ?? Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
          s.update(p, now);
          const a = p < ACT_EDGES[0] ? 1 : p < ACT_EDGES[1] ? 2 : 3;
          if (a !== lastAct) { lastAct = a; setAct(a); }
          el.style.setProperty('--p', p.toFixed(3));
          const fly = p > 0.12 && p < ACT_EDGES[0]; // kamera dönerken başlık çekilir
          if (fly !== lastFly) { lastFly = fly; el.classList.toggle('fly', fly); }
        };
        // ?film: tanıtım filmi çekimi (scripts/film-capture.mjs) kareyi ve ilerlemeyi dışarıdan sürer; kendi döngüsü çalışmaz
        if (new URLSearchParams(location.search).has('film')) { (window as unknown as { __film: unknown }).__film = { frame }; return; }
        const loop = (now: number) => {
          if (visible) frame(now);
          // IntersectionObserver sıçramalı kaydırmada tetiklenmez; durumu karede doğrula
          document.body.classList.toggle('past-story', el.getBoundingClientRect().bottom < 72);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      } catch (err) {
        console.warn('3D sahne açılamadı', err); // WebGL yoksa kapak görseli kalır
        document.body.classList.add('no-webgl');
      }
    })();
    return () => { off = true; cancelAnimationFrame(raf); stage.current?.dispose(); stage.current = null; document.body.classList.remove('no-webgl'); };
  }, [lang]);

  // seçim sahneye yansır (marka ve fren görseli değiştirmez)
  useEffect(() => { stage.current?.setConfig({ ...cfg }); }, [cfg.type, cfg.L, cfg.axles, cfg.color]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { stage.current?.setView(view); }, [view]);

  const s = useMemo(() => computeSpecs(cfg), [cfg]);
  const kind = CAPACITY_KINDS[s.capacityKind as keyof typeof CAPACITY_KINDS];
  const renk = t(colorByHex(cfg.color!).label);
  const marka = t(byId(AXLE_BRANDS, cfg.brand!).label), fren = t(byId(BRAKES, cfg.brake!).label);
  const ops = (cfg.options ?? []).map((id) => t(byId(OPTIONS, id).label));
  const teklif = `${L('/iletisim/')}?${new URLSearchParams({ tip: cfg.type, uzunluk: num(cfg.L), dingil: String(cfg.axles), renk, marka, fren, ...(ops.length ? { ops: ops.join(', ') } : {}) })}#teklif`;
  const sartname = `${L('/sartname/')}?${new URLSearchParams({ tip: cfg.type, L: String(cfg.L), dingil: String(cfg.axles), renk: String(cfg.color), marka: cfg.brand!, fren: cfg.brake!, ops: (cfg.options ?? []).join(',') })}`;

  const group = (n: number, label: string, body: React.ReactNode) => (
    <div className="cfg-group" data-step={n}><span className="cfg-l">{t(label)}</span>{body}</div>
  );
  const go = (p: number) => {
    const el = acts.current!;
    scrollTo({ top: el.getBoundingClientRect().top + scrollY + p * (el.offsetHeight - innerHeight), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <section ref={acts} className={`acts${live ? ' live' : ''}`} id="acts" data-act={act} aria-label={t('Treyler: sinematik sahne, teknik çizim ve yapılandırıcı')}>
      <div className="acts-stage">
        <canvas ref={canvas} id="stage" aria-hidden="true" />
        <svg ref={svg} id="dims" aria-hidden="true" />

        <div className="act a1">
          <p className="kicker">{t(HERO.kicker)}</p>
          <h1>{SITE.ad.split(' ')[0]}<br />{SITE.ad.split(' ').slice(1).join(' ')}</h1>
          <p className="lead">{t(HERO.lead)}</p>
          <nav className="hero-groups" aria-label={t('Ürün grupları')}>
            {PRODUCTS.map((p) => <Link key={p.slug} href={L(`/urun/${p.slug}/`)}>{t(p.ad).replace(/ (Treyler|Trailer)$/, '')}</Link>)}
          </nav>
          <div className="cta"><Link className="btn" href={`${L('/iletisim/')}#teklif`}>{t('Teklif Al')}</Link><a className="btn ghost" href="#urunler">{t('Ürünleri Gez')}</a></div>
          <p className="hero-contact"><a href={`tel:${SITE.tel}`}>{SITE.telefon}</a><a href={`https://wa.me/${SITE.whatsapp}`} rel="noopener">WhatsApp</a></p>
        </div>
        <div className="act a2">
          <p className="kicker">{t('02 · teknik çizim')}</p>
          <h2>{t('Her ölçü')}<br />{t('hesaplı.')}</h2>
          <p className="lead">{t('Şasi, dingil ve kingpin yerleri çizimde. Değerler şablon örneğidir.')}</p>
        </div>
        <div className="act a3">
          <p className="kicker">{t('03 · yapılandır')}</p>
          <h2>{t('Kendi treylerinizi kurun.')}</h2>
          <div className="config" id="config" data-step={step}>
            <div className="cfg-steps" role="tablist" aria-label={t('Yapılandırma adımları')}>
              {STEPS.map((l, i) => <button key={l} type="button" role="tab" aria-selected={step === i + 1} onClick={() => setStep(i + 1)}><b>{i + 1}</b>{t(l)}</button>)}
            </div>
            {group(1, 'Tip', <div className="chips">{Object.entries(TYPES).map(([k, v]) => <Chip key={k} on={cfg.type === k} label={t(v.label)} onClick={() => set({ type: k })} />)}</div>)}
            <div className="cfg-group" data-step="1"><label className="cfg-l" htmlFor="cfg-len">{t('Uzunluk')} <b>{num(cfg.L)} m</b></label>
              <input id="cfg-len" type="range" min={LENGTH.min} max={LENGTH.max} step={LENGTH.step} value={cfg.L} onChange={(e) => set({ L: +e.target.value })} /></div>
            {group(2, 'Dingil', <div className="chips">{AXLES.options.map((n) => <Chip key={n} on={cfg.axles === n} label={String(n)} onClick={() => set({ axles: n })} />)}</div>)}
            {group(2, 'Dingil markası', <div className="chips">{AXLE_BRANDS.map((x) => <Chip key={x.id} on={cfg.brand === x.id} label={t(x.label)} onClick={() => set({ brand: x.id })} />)}</div>)}
            {group(2, 'Fren', <div className="chips">{BRAKES.map((x) => <Chip key={x.id} on={cfg.brake === x.id} label={t(x.label)} onClick={() => set({ brake: x.id })} />)}</div>)}
            {group(3, 'Opsiyonlar', <div className="chips">{OPTIONS.map((x) => {
              const on = (cfg.options ?? []).includes(x.id);
              return <Chip key={x.id} on={on} label={t(x.label)} onClick={() => set({ options: on ? cfg.options!.filter((i) => i !== x.id) : [...(cfg.options ?? []), x.id] })} />;
            })}</div>)}
            <div className="cfg-group" data-step="3"><span className="cfg-l">{t('Renk')} <b>{renk}</b></span>
              <div className="swatches">{COLORS.map((c) => <button key={c.hex} type="button" aria-label={t(c.label)} title={t(c.label)} aria-pressed={cfg.color === c.hex} style={{ '--c': hex6(c.hex) } as React.CSSProperties} onClick={() => set({ color: c.hex })} />)}</div></div>
            <div className="cfg-group" data-step="4"><span className="cfg-l">{t('Özet şartname')}</span>
              <dl className="cfg-sum">{[[t('Tip'), t(TYPES[cfg.type as keyof typeof TYPES].label)], [t('Uzunluk'), `${num(cfg.L)} m`], [t('Dingil'), `${cfg.axles}, ${marka}`], [t('Fren'), fren], [t('Renk'), renk], [t('Opsiyonlar'), ops.join(', ') || t('Yok')]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              <Link className="btn ghost" target="_blank" rel="noopener" href={sartname}>{t('Şartname (PDF)')}</Link></div>
            {group(0, 'Görünüm', <div className="chips">{[['yan', 'Yan'], ['ust', 'Üst'], ['3d', '3D']].map(([k, l]) => <Chip key={k} on={view === k} label={t(l)} onClick={() => setView(k)} />)}</div>)}
            <dl className="cfg-spec" aria-live="polite">
              <div><dt>{t('Azami yük')}</dt><dd>{num(s.payload)} t</dd></div>
              <div><dt>{t(kind.label)}</dt><dd>{num(s.capacity, s.capacityDigits)} {kind.unit}</dd></div>
              <div><dt>{t('Dara')}</dt><dd>{num(s.tare)} t</dd></div>
            </dl>
            <p className="small">{t(s.exact ? 'Üretim verisinden alınmıştır.' : 'Örnek hesaptır, kesin değerler teklifte yazılır.')}</p>
            <div className="cfg-nav">
              <button type="button" className="btn ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>{t('Geri')}</button>
              <button type="button" className="btn ghost" disabled={step === STEPS.length} onClick={() => setStep(step + 1)}>{t('İleri')}</button>
            </div>
            <Link className="btn" href={teklif}>{t('Bu yapılandırmayla Teklif Al')}</Link>
          </div>
        </div>

        <nav className="rail" aria-label={t('Sahne adımları')}>
          {([['sinematik', 0.02], ['çizim', 0.5], ['yapılandır', 0.9]] as const).map(([l, p], i) => <button key={l} type="button" className={act === i + 1 ? 'on' : ''} onClick={() => go(p)}>{t(l)}</button>)}
        </nav>
        <p className="scrollhint" aria-hidden="true">{t('kaydırın')}</p>
      </div>
    </section>
  );
}
