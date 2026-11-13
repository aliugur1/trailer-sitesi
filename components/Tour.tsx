'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import type * as T from 'three';
import { SITE } from '@/content/site';
import { TOUR, TOUR_HERO } from '@/content/tour';
import { href, makeT, type Lang } from '@/lib/i18n';

// Sinematik ürün turu: kaydırdıkça kamera araçların çevresinde gezer, "360° İncele" ile serbest inceleme açılır.
// Sahne yalnızca tarayıcıda yüklenir; metinler sunucuda basılır (SEO).
export default function Tour({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const L = (p: string) => href(lang, p);
  const sectionCount = TOUR.length + 1;

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    (async () => {
      const [THREE, { default: gsap }, { OrbitControls }, { createWorld, PATH, SECTION_KEYS, FOCUS }] = await Promise.all([
        import('three'), import('gsap'), import('three/addons/controls/OrbitControls.js'), import('@/lib/three/scene'),
      ]);
      // logo dokusu font yüklenmeden çizilmesin (en fazla 1,5 sn bekle)
      await Promise.race([document.fonts.load('800 88px Archivo'), new Promise((r) => setTimeout(r, 1500))]).catch(() => {});
      if (disposed) return;

      const $ = (s: string) => document.querySelector(s) as HTMLElement;
      const $$ = (s: string) => [...document.querySelectorAll(s)] as HTMLElement[];
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const introSeen = (() => { try { return sessionStorage.getItem('intro') === '1'; } catch { return false; } })();
      const skipIntro = reduced || introSeen || location.search.includes('skip');
      const sections = $$('.stage');
      const root = document.documentElement;
      const lockScroll = (on: boolean) => { root.style.overflow = on ? 'hidden' : ''; };
      document.body.classList.add('tour');

      let world;
      try {
        world = createWorld($('#gl') as unknown as HTMLCanvasElement);
      } catch (e) {
        console.warn('WebGL başlatılamadı', e);
        document.body.classList.add('no-webgl', 'ready');
        return;
      }
      const { camera, rig, update, renderer } = world;
      const wheels = rig.userData.wheels;
      const beams = rig.userData.beams;

      // ---------- kamera yolu ----------
      const posCurve = new THREE.CatmullRomCurve3(PATH.map((p: T.Vector3[]) => p[0]), false, 'catmullrom', 0.5);
      const tgtCurve = new THREE.CatmullRomCurve3(PATH.map((p: T.Vector3[]) => p[1]), false, 'catmullrom', 0.5);
      const N = PATH.length - 1;
      const pos = new THREE.Vector3(), tgt = new THREE.Vector3();
      const look = new THREE.Vector3(), dir = new THREE.Vector3(), right = new THREE.Vector3();
      const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
      const intro = { k: 0 };
      let s = 0, free = false;

      function pose(sec: number) {
        const i = Math.min(Math.floor(sec), SECTION_KEYS.length - 2);
        const f = sec - i;
        const e = f * f * (3 - 2 * f); // durakta bekleme hissi
        const p = (SECTION_KEYS[i] + (SECTION_KEYS[i + 1] - SECTION_KEYS[i]) * e) / N;
        posCurve.getPoint(p, pos);
        tgtCurve.getPoint(p, tgt);
        if (camera.aspect < 0.9) { pos.sub(tgt).multiplyScalar(1.15).add(tgt); tgt.y -= 2.2; } // dikey ekranda hafif geri çekil
      }
      const onPointer = (e: PointerEvent) => { ptr.x = (e.clientX / innerWidth - 0.5) * 2; ptr.y = (e.clientY / innerHeight - 0.5) * 2; };
      addEventListener('pointermove', onPointer);

      // ---------- serbest inceleme ----------
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enabled = false;
      controls.enableDamping = true;
      controls.maxPolarAngle = Math.PI / 2 - 0.04;
      controls.minDistance = 4;
      controls.maxDistance = 40;
      const setFree = (on: boolean, i?: number) => {
        free = on;
        controls.enabled = on;
        document.body.classList.toggle('free', on);
        lockScroll(on);
        if (on && i != null) { controls.target.copy((FOCUS as Record<number, T.Vector3>)[i]); controls.update(); }
      };
      $$('[data-free]').forEach((b) => (b.onclick = () => setFree(true, +(b.dataset.free as string))));
      $('#freeExit').onclick = () => setFree(false);
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && free && setFree(false);
      addEventListener('keydown', onKey);

      // ---------- açılış sekansı ----------
      const speedEl = $('#speed b');
      let lastZ = 0;
      let tl: gsap.core.Timeline | null = null;
      function finishIntro() {
        document.body.classList.remove('intro');
        lockScroll(false);
        intro.k = 0;
      }
      function playIntro() {
        if (skipIntro) { rig.position.z = 0; finishIntro(); return; }
        try { sessionStorage.setItem('intro', '1'); } catch { /* özel pencere: her seferinde oynar */ }
        document.body.classList.add('intro');
        lockScroll(true);
        rig.position.z = -90;
        lastZ = -90;
        beams.forEach((b: T.SpotLight) => { b.userData.i = b.intensity; b.intensity = 0; });
        intro.k = 1;
        tl = gsap.timeline({ onComplete: finishIntro });
        tl.to('.bar.top', { yPercent: -100, duration: 1.8, ease: 'power3.inOut' }, 0.3)
          .to('.bar.bottom', { yPercent: 100, duration: 1.8, ease: 'power3.inOut' }, 0.3)
          .to(beams, { intensity: (_: number, b: T.SpotLight) => b.userData.i, duration: 1.6, ease: 'power2.in' }, 0)
          .to(rig.position, { z: 0, duration: 6, ease: 'power3.out' }, 0.3)
          .to(intro, { k: 0, duration: 6.3, ease: 'power2.out' }, 0.2);
        $('#skip').onclick = () => tl?.progress(1);
      }

      // ---------- döngü ----------
      const timer = new THREE.Timer();
      let kmh = 0;
      const dots = $$('#rail button');
      dots.forEach((b, i) => { b.onclick = () => scrollTo({ top: i * innerHeight, behavior: reduced ? 'auto' : 'smooth' }); });
      renderer.setAnimationLoop(() => {
        timer.update();
        const dt = Math.min(timer.getDelta(), 0.05);
        const tt = timer.getElapsed();
        const dz = rig.position.z - lastZ; // tekerlekler araç hareketine göre döner
        lastZ = rig.position.z;
        if (dz) wheels.forEach((w: T.Object3D) => (w.rotation.x += dz / 0.5));
        kmh += ((dt ? Math.abs(dz) / dt : 0) * 3.6 - kmh) * Math.min(1, dt * 6);
        speedEl.textContent = String(Math.round(kmh));

        if (free) {
          controls.update();
          look.copy(controls.target);
        } else {
          const want = Math.min(scrollY / innerHeight, sections.length - 1);
          s += (want - s) * (1 - Math.exp(-dt * 4));
          pose(s);
          if (!reduced) {
            ptr.sx += (ptr.x - ptr.sx) * Math.min(1, dt * 3);
            ptr.sy += (ptr.y - ptr.sy) * Math.min(1, dt * 3);
            camera.getWorldDirection(dir);
            right.crossVectors(dir, camera.up).normalize();
            pos.addScaledVector(right, ptr.sx * 0.6).y -= ptr.sy * 0.25;
          }
          pos.y -= 0.45 * intro.k;
          pos.z += 3 * intro.k;
          const f = 1 - Math.exp(-dt * 5);
          if (tt < 0.1) { camera.position.copy(pos); look.copy(tgt); }
          camera.position.lerp(pos, f);
          look.lerp(tgt, f);
          camera.lookAt(look);
        }
        const active = Math.round(s);
        dots.forEach((d, i) => d.classList.toggle('on', i === active));
        if (scrollY < innerHeight * (sections.length + 0.2)) update(tt, dt); // hikâye bitince sahneyi çizme
      });

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (disposed) { renderer.setAnimationLoop(null); return; }
      document.body.classList.add('ready');
      playIntro();

      cleanup = () => {
        renderer.setAnimationLoop(null);
        tl?.kill();
        controls.dispose();
        removeEventListener('pointermove', onPointer);
        removeEventListener('keydown', onKey);
        lockScroll(false);
        renderer.dispose();
      };
    })();
    return () => {
      disposed = true;
      cleanup?.();
      document.body.classList.remove('tour', 'intro', 'free', 'ready', 'no-webgl');
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <>
      <canvas id="gl" aria-hidden="true" />
      <div className="bar top" /><div className="bar bottom" />
      <div className="vignette" /><div className="grain" />
      <div id="loader" aria-hidden="true"><span>{SITE.ad.split(' ')[0].toUpperCase()}<b>{SITE.ad.split(' ').slice(1).join(' ').toUpperCase()}</b></span></div>
      <div id="speed" aria-hidden="true"><b>0</b><i>km/s</i></div>
      <button id="skip" type="button">{t('Girişi geç')}</button>
      <nav id="rail" aria-label={t('Bölümler')}>
        {Array.from({ length: sectionCount }, (_, i) => <button key={i} type="button" aria-label={`${t('Bölüme git')}: ${i + 1}`} />)}
      </nav>
      <div id="free">
        <span>{t('Sürükle: döndür. Tekerlek: yakınlaş.')}</span>
        <button id="freeExit" type="button">{t('Çık (Esc)')}</button>
      </div>

      <main id="scroll">
        <section className="stage left" id="top">
          <div className="panel hero-copy">
            <p className="kicker reveal">{t(TOUR_HERO.kicker)}</p>
            <h1 className="reveal">{t(TOUR_HERO.title[0])}<br />{t(TOUR_HERO.title[1])}</h1>
            <p className="lead reveal">{t(TOUR_HERO.lead)}</p>
            <a className="btn reveal" href="#duz">{t('Turu başlat')}</a>
          </div>
        </section>
        {TOUR.map((sec) => (
          <section key={sec.title} className={`stage ${sec.side}`} id={sec.id}>
            <div className="panel">
              <h2 className="reveal">{t(sec.title)}</h2>
              {sec.lead && <p className="lead reveal">{t(sec.lead)}</p>}
              {sec.specs && <dl className="specs reveal">{sec.specs.map(([k, v]) => <div key={k}><dt>{t(k)}</dt><dd>{t(v)}</dd></div>)}</dl>}
              {sec.list && <ul className="list reveal">{sec.list.map((x) => <li key={x}>{t(x)}</li>)}</ul>}
              {sec.free != null && (
                <div className="cta reveal">
                  <button className="btn" data-free={sec.free} type="button">{t('360° İncele')}</button>
                  <Link className="btn ghost" href={L(`/urun/${sec.slug}/`)}>{t('Ayrıntılar')}</Link>
                </div>
              )}
              {sec.cta === 'all' && <a className="btn reveal" href="#urun-listesi">{t('Tüm ürünler')}</a>}
              {sec.cta === 'quote' && (
                <div className="cta reveal">
                  <Link className="btn" href={`${L('/iletisim/')}#teklif`}>{t('Teklif Al')}</Link>
                  <a className="btn ghost" href={`tel:${SITE.tel}`}>{t('Hemen Ara')}</a>
                </div>
              )}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
