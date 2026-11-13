import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildFlatbed, buildCurtain, buildTanker, buildBox, buildTractor, setLanding } from './trailers.js';
import { groundMaterial, dashTexture, bokehPoints, blobTexture, BLOOM } from './scene.js';
import { overrideFor, modelFor } from './models.config.js';
import { DEFAULTS, GEOMETRY } from '../../content/configurator';
import { makeT, makeNum } from '../i18n';

// Tek sahne, üç kip: gece yolu (sinematik) → mavi çizim (teknik) → yapılandırıcı (ikisinin karışımı)
export const BUILDERS = { duz: buildFlatbed, tenteli: buildCurtain, tanker: buildTanker, kasa: buildBox };
export const ACT_EDGES = [0.34, 0.67]; // perde sınırları (ilerleme 0..1)

const DAY = new THREE.Color(0xbac6d1); // gündüz gökyüzü / ufuk sisi
const NAVY = new THREE.Color(0x0a2748);
const LINE = new THREE.Color(0xcfe3ff);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Kamera durakları: p, konum, hedef, fov ('fit' = yan görünüşü ekrana sığdır)
const KEYS = [
  { p: 0.0, pos: V(11, 2.8, 26), tgt: V(0, 1.9, 3), fov: 34 },
  { p: 0.1, pos: V(14, 3.4, 12), tgt: V(0, 1.6, 3), fov: 34 },
  { p: 0.22, pos: V(-9, 3.2, -13), tgt: V(0, 1.5, -1), fov: 34 },
  { p: 0.3, pos: V(14, 3, -14), tgt: V(0, 1.5, 0), fov: 30 },
  { p: 0.4, pos: V(34, 1.6, 0), tgt: V(0, 1.6, 0), fov: 'fit' },
  { p: 0.6, pos: V(34, 1.6, 0), tgt: V(0, 1.6, 0), fov: 'fit' },
];
const VIEWS = {
  yan: { pos: V(34, 1.6, 0), tgt: V(0, 1.6, 0), fov: 'fit', up: V(0, 1, 0) },
  ust: { pos: V(0, 40, 0.01), tgt: V(0, 0, 0), fov: 'top', up: V(0, 0, 1) },
  '3d': { pos: V(15, 6.5, 19), tgt: V(0, 1.4, 0), fov: 32, up: V(0, 1, 0) },
};

// fixedQuality: uyarlanabilir çözünürlüğü kapatır (görsel üretimi ve testler için)
export function createStage(canvas, svg, { fixedQuality = false, initial = {}, lang = 'tr' } = {}) {
  const t = makeT(lang), num = makeNum(lang);
  const small = matchMedia('(max-width: 700px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  const baseDpr = Math.min(devicePixelRatio, small ? 1.5 : 2);
  let quality = 1; // kare süresi uzarsa düşer (alt sınır 0.55)
  renderer.setPixelRatio(baseDpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !small;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.info.autoReset = false; // kare başına toplam çizim çağrısı ölçülebilsin

  const scene = new THREE.Scene();
  scene.background = DAY.clone();
  scene.fog = new THREE.FogExp2(DAY.getHex(), 0.0065);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environmentIntensity = 0.75;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 600);

  const hemi = new THREE.HemisphereLight(0xe3ecf5, 0x7b7e82, 1.0);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xfff0d8, 1.7); // güneş
  moon.position.set(-24, 38, 22);
  scene.add(moon);
  const key = new THREE.SpotLight(0xfff4e3, 520, 90, 0.7, 0.9, 1.1);
  key.position.set(-16, 26, 18);
  key.target.position.set(0, 0, -2);
  key.castShadow = renderer.shadowMap.enabled;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 6;
  key.shadow.camera.far = 40;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.03;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xdfe9ff, 0.5); // kamera tarafı dolgu: gövde detayı karanlıkta kaybolmasın
  fill.position.set(8, 26, 10); // dik gelir: ıslak zeminde sıyırma parlaması yapmaz
  scene.add(fill);
  const rimL = new THREE.PointLight(0xffc400, 0, 40, 1.8);
  rimL.position.set(-7, 3, -14);
  scene.add(rimL);

  // ---- zemin (gece) ----
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), groundMaterial());
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  // kuru gündüz asfaltı: ıslak yansıma ve koyu doku açılır
  ground.material.roughnessMap = null; ground.material.roughness = 0.96; ground.material.color.setScalar(4.4); ground.material.needsUpdate = true;
  ground.material.envMapIntensity = 0.06; // su birikintileri ortam haritasındaki parlak tavanı yansıtıp ağarmasın
  scene.add(ground);
  const dash = dashTexture();
  const lanes = new THREE.Group();
  for (const x of [-5.2, 5.2]) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 300), new THREE.MeshStandardMaterial({ map: dash, transparent: true, roughness: 0.5 }));
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.01, 0);
    lanes.add(line);
  }
  scene.add(lanes);
  const bokeh = bokehPoints();
  scene.add(bokeh);
  // temas gölgesi: gölge haritası olmayan cihazlarda da treyler yere otursun
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, opacity: 0.6 }));
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.02;
  scene.add(blob);

  // ---- çizim: zemin, yer ızgarası ve treylerin arkasında dik pafta ızgarası ----
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshBasicMaterial({ color: NAVY, transparent: true, opacity: 0, fog: false, depthWrite: false, toneMapped: false }));
  sheet.rotation.x = -Math.PI / 2;
  sheet.position.y = 0.03;
  sheet.renderOrder = -1;
  scene.add(sheet);
  const gridStyle = (g) => { for (const m of [].concat(g.material)) { m.transparent = true; m.opacity = 0; m.fog = false; m.depthWrite = false; m.toneMapped = false; } g.renderOrder = -0.5; return g; };
  const grid = gridStyle(new THREE.GridHelper(120, 120, 0x6fa4e8, 0x2f5f9c));
  grid.position.y = 0.04;
  const wall = gridStyle(new THREE.GridHelper(160, 160, 0x9cc4ff, 0x2f5f9c));
  wall.rotation.z = Math.PI / 2;
  wall.position.x = -8;
  for (const m of [].concat(wall.material)) m.depthTest = false; // zemin altında da görünsün; yalnızca treyler saydamken çizilir
  scene.add(grid, wall);
  const setOpacity = (g, o) => { for (const m of [].concat(g.material)) m.opacity = o; g.visible = o > 0.004; };

  // ---- araçlar ----
  const world = new THREE.Group();
  scene.add(world);
  const tractor = buildTractor();
  world.add(tractor);
  overrideFor('truck', { length: 6.3 }).then((model) => {
    if (!model) return;
    const { beams } = tractor.userData;
    tractor.clear();
    tractor.add(model, ...beams, ...beams.map((b) => b.target));
    tractor.userData.wheels = model.userData.wheels;
    dirty = true;
  }).catch((e) => console.warn('Çekici modeli yüklenemedi, örnek model kullanılıyor', e));
  const lineMat = new THREE.LineBasicMaterial({ color: LINE, transparent: true, opacity: 0, fog: false, depthWrite: false });

  let trailer = null, mats = [], cfg = { ...DEFAULTS }, lengthNow = cfg.L, topY = 3, axleZ = [], kpZ = 0;
  let dirty = true, request = 0;
  const failed = new Set();

  function dispose(o) {
    o.traverse((c) => { if (c.geometry && !c.geometry.userData.shared) c.geometry.dispose(); });
    o.userData.ownMaterials?.forEach((m) => m.dispose());
  }

  // Yeni treyleri sahneye koyar: çizim kenarları, saydamlık için malzeme listesi, ölçü bağlantı noktaları
  function mount(obj) {
    if (trailer) { world.remove(trailer); dispose(trailer); }
    trailer = obj;
    lengthNow = trailer.userData.length ?? cfg.L;
    const set = new Set(), hosts = [];
    trailer.traverse((m) => {
      if (m.isMesh) [].concat(m.material).forEach((x) => set.add(x));
      if (m.userData.edgeGeo) hosts.push(m);
    });
    hosts.forEach((m) => {
      const ls = new THREE.LineSegments(m.userData.edgeGeo, lineMat);
      ls.userData.edge = true;
      m.add(ls);
    });
    mats = [...set];
    mats.forEach((m) => { if (m.userData.o == null) { m.userData.o = m.opacity; m.userData.t = m.transparent; } });
    world.add(trailer);
    trailer.updateMatrixWorld(true);
    const box = new THREE.Box3();
    trailer.traverse((c) => { if (c.isMesh) box.expandByObject(c); });
    topY = box.max.y;
    axleZ = [...(trailer.userData.axleZ ?? [])].sort((a, b) => b - a); // önden arkaya: A1 en öndeki dingil
    kpZ = trailer.userData.kingpinZ ?? lengthNow / 2 - GEOMETRY.kingpinSetback;
    blob.scale.set(GEOMETRY.width * 2.3, lengthNow * 1.16, 1);
    canvas.dataset.model = trailer.userData.source ?? 'procedural';
    renderer.shadowMap.needsUpdate = true;
    dirty = true;
  }

  function setConfig(next) {
    cfg = { ...cfg, ...next };
    const id = ++request;
    const build = () => BUILDERS[cfg.type]({ L: cfg.L, axles: cfg.axles, color: cfg.color });
    const spec = modelFor(cfg.type);
    if (!spec || failed.has(spec.url)) { mount(build()); return; }
    // gerçek model: gelene kadar örnek model (ya da önceki GLB) sahnede kalır
    if (!trailer || trailer.userData.source !== 'glb') mount(build());
    overrideFor(cfg.type, { length: cfg.L, color: cfg.color }).then((model) => {
      if (id === request) mount(model); else dispose(model);
    }).catch((e) => {
      console.warn(`Model yüklenemedi (${spec.url}), örnek model kullanılıyor`, e);
      failed.add(spec.url);
      if (id === request) mount(build());
    });
  }

  // ---- post ----
  // Kenar yumuşatma: sahne çok örneklemeli hedefe çizilir (bloom zinciri tuval kenar yumuşatmasını kullanamaz)
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: small ? 2 : 4 }));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), BLOOM.strength, BLOOM.radius, BLOOM.threshold);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let W = 1, H = 1;
  function fitFov(d) {
    const half = lengthNow / 2 + 3.6; // yükseklik ölçüsü ve etiketi için kenar payı
    return Math.max(12, THREE.MathUtils.radToDeg(2 * Math.atan(half / (d * camera.aspect))));
  }
  function resize() {
    W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
    renderer.setPixelRatio(baseDpr * quality);
    renderer.setSize(W, H, false);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    dirty = true;
  }
  addEventListener('resize', resize);
  const stopResize = () => removeEventListener('resize', resize);

  // ---- kamera ----
  const goal = { pos: V(8, 2, 17), tgt: V(0, 1.7, 5), up: V(0, 1, 0), fov: 34 };
  const cur = { pos: goal.pos.clone(), tgt: goal.tgt.clone(), up: V(0, 1, 0), fov: 34 };
  let view = '3d', first = true;
  const resolveFov = (f, pos, tgt) => (f === 'fit' ? fitFov(pos.distanceTo(tgt)) : f === 'top' ? THREE.MathUtils.radToDeg(2 * Math.atan((lengthNow / 2 + 2) / 40)) : f);

  function aim(p) {
    let g;
    if (p >= ACT_EDGES[1] - 0.02) {
      const v = VIEWS[view];
      g = { pos: v.pos, tgt: v.tgt, up: v.up, fov: v.fov };
      if (view === '3d') { const k = camera.aspect < 1 ? 1 + (1 - camera.aspect) * 0.9 : 1; goal.pos.copy(v.pos).sub(v.tgt).multiplyScalar(k).add(v.tgt); g.pos = goal.pos; }
    } else {
      let i = 0;
      while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
      const a = KEYS[i], b = KEYS[i + 1];
      const t = smooth(0, 1, (p - a.p) / (b.p - a.p));
      const k = camera.aspect < 1 && b.fov !== 'fit' ? 1 + (1 - camera.aspect) * 0.9 : 1;
      const pa = a.pos.clone().sub(a.tgt).multiplyScalar(a.fov === 'fit' ? 1 : k).add(a.tgt);
      const pb = b.pos.clone().sub(b.tgt).multiplyScalar(b.fov === 'fit' ? 1 : k).add(b.tgt);
      const pos = pa.lerp(pb, t), tgt = a.tgt.clone().lerp(b.tgt, t);
      const fa = resolveFov(a.fov, pa, a.tgt), fb = resolveFov(b.fov, pb, b.tgt);
      g = { pos, tgt, up: V(0, 1, 0), fov: fa + (fb - fa) * t };
    }
    goal.pos = g.pos; goal.tgt = g.tgt; goal.up = g.up;
    goal.fov = typeof g.fov === 'number' ? g.fov : resolveFov(g.fov, g.pos, g.tgt);
  }

  // ---- ölçü katmanı (SVG, her karede 3B noktaların ekran izdüşümü) ----
  // Yerleşim: gövdenin üstüne hiçbir etiket konmaz. Zeminin altında üç sıra vardır:
  // 1) istasyon adları (A1.., KINGPIN), 2) zincir ölçü (arka çıkıntı, dingil aralıkları, kingpin), 3) toplam uzunluk.
  // Yükseklik arka tarafta, gövdenin dışındadır. Sığmayan ya da çakışan etiket çizilmez.
  const NS = 'http://www.w3.org/2000/svg';
  const pool = new Map(), used = new Set();
  let boxes = [];
  const node = (id, tag, cls) => {
    let e = pool.get(id);
    if (!e) { e = document.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); e.dataset.d = id; svg.append(e); pool.set(id, e); }
    used.add(id);
    e.removeAttribute('display');
    return e;
  };
  const scr = (x, y, z) => { const v = V(x, y, z).project(camera); return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H]; };
  const seg = (id, x1, y1, x2, y2, cls) => { const e = node(id, 'line', cls); e.setAttribute('x1', x1.toFixed(1)); e.setAttribute('y1', y1.toFixed(1)); e.setAttribute('x2', x2.toFixed(1)); e.setAttribute('y2', y2.toFixed(1)); };
  const tick = (id, x, y) => seg(id, x - 4, y + 4, x + 4, y - 4);
  // etiket: önce kutusu ayrılır; daha önce yerleşmiş bir etiketle kesişiyorsa çizilmez
  function label(id, x, y, text, { size = 13, vertical = false, cls = '' } = {}) {
    const w = text.length * size * 0.62 + 6, h = size + 4;
    const b = vertical ? [x - h / 2, y - w / 2, x + h / 2, y + w / 2] : [x - w / 2, y - h + 3, x + w / 2, y + 3];
    if (boxes.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])) return false;
    boxes.push(b);
    const e = node(id, 'text', cls);
    e.setAttribute('x', x.toFixed(1)); e.setAttribute('y', y.toFixed(1));
    if (vertical) e.setAttribute('transform', `rotate(-90 ${x.toFixed(1)} ${y.toFixed(1)})`); else e.removeAttribute('transform');
    if (e.textContent !== text) e.textContent = text;
    return true;
  }
  const m2 = (n) => num(n, 2);

  function dims() {
    used.clear(); boxes = [];
    const l = lengthNow, zr = -l / 2, zf = l / 2;
    const X = (z) => scr(0, 0, z)[0];
    const gy = scr(0, 0, 0)[1];
    const compact = W < 700;
    const r1 = gy + (compact ? 20 : 26), r2 = gy + (compact ? 42 : 56), r3 = gy + (compact ? 70 : 92);
    const xr = X(zr), xf = X(zf), out = Math.sign(xr - xf) || 1; // ekranda arkadan dışarı yön

    // 3) toplam uzunluk
    seg('len', xr, r3, xf, r3);
    tick('len-ta', xr, r3); tick('len-tb', xf, r3);
    seg('len-wa', xr, gy + 4, xr, r3 + 7, 'w'); seg('len-wb', xf, gy + 4, xf, r3 + 7, 'w');
    label('len-t', (xr + xf) / 2, r3 + (compact ? 17 : 20), `${t('UZUNLUK')} ${m2(l)} m`);

    // yükseklik: arka tarafta, gövdenin dışında
    const hx = xr + out * (compact ? 24 : 46), ty = scr(0, topY, zr)[1];
    seg('hgt', hx, gy, hx, ty);
    tick('hgt-ta', hx, gy); tick('hgt-tb', hx, ty);
    seg('hgt-wa', xr + out * 6, gy, hx + out * 7, gy, 'w'); seg('hgt-wb', xr + out * 6, ty, hx + out * 7, ty, 'w');
    label('hgt-t', hx + out * 13, (gy + ty) / 2, `${m2(topY)} m`, { vertical: true });

    // 1) istasyonlar: kingpin ve dingiller
    const kx = X(kpZ), kp = scr(0, 0.96, kpZ);
    const c = node('kp-c', 'circle'); c.setAttribute('cx', kp[0].toFixed(1)); c.setAttribute('cy', kp[1].toFixed(1)); c.setAttribute('r', 4);
    seg('kp-x', kp[0] - 8, kp[1], kp[0] + 8, kp[1]);
    seg('kp-l', kx, kp[1] + 4, kx, gy + 5, 'w');
    label('kp-t', kx, r1, 'KINGPIN');
    const stations = [zr];
    [...axleZ].reverse().forEach((z) => stations.push(z));
    axleZ.forEach((z, i) => { const x = X(z); seg(`ax${i}`, x, gy + 3, x, gy + 9); label(`ax${i}-t`, x, r1, `A${i + 1}`); });
    if (kpZ > stations[stations.length - 1] && kpZ < zf) stations.push(kpZ);
    stations.push(zf);

    // 2) zincir ölçü
    seg('ch', xr, r2, xf, r2);
    stations.forEach((z, i) => {
      const x = X(z);
      tick(`ch-t${i}`, x, r2);
      if (i > 0 && i < stations.length - 1) seg(`ch-w${i}`, x, r1 + 6, x, r2 + 6, 'w');
      if (!i) return;
      const x0 = X(stations[i - 1]), txt = m2(z - stations[i - 1]);
      if (Math.abs(x - x0) > txt.length * 11 * 0.62 + 14) label(`ch-l${i}`, (x + x0) / 2, r2 - 6, txt, { size: 11, cls: 's' });
    });

    for (const [id, e] of pool) if (!used.has(id)) e.setAttribute('display', 'none');
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let off = 0, t0 = performance.now(), lastP = -1, lastView = view, slow = 0, landK = -1;

  // Bir kare çizer. Hiçbir şey değişmediyse (kaydırma durdu, kamera oturdu) çizmeden döner: false.
  function update(p, now = performance.now()) {
    const frame = now - t0;
    const dt = Math.min(0.05, frame / 1000);
    t0 = now;
    aim(p);
    const target = 90 * smooth(0.08, 0.3, p) ** 1.6;
    const settled = Math.abs(target - off) < 1e-3 && cur.pos.distanceToSquared(goal.pos) < 1e-6 && cur.tgt.distanceToSquared(goal.tgt) < 1e-6 && cur.up.distanceToSquared(goal.up) < 1e-6 && Math.abs(cur.fov - goal.fov) < 1e-3;
    if (!dirty && p === lastP && view === lastView && settled) return false;
    // uyarlanabilir çözünürlük: art arda yavaş kareler gelirse piksel oranını düşür
    if (!fixedQuality && !dirty && frame < 200) {
      slow = frame > 24 ? slow + 1 : Math.max(0, slow - 2);
      if (slow > 45 && quality > 0.55) { quality = Math.max(0.55, quality - 0.15); slow = 0; resize(); }
    }
    dirty = false; lastP = p; lastView = view;
    renderer.info.reset();

    // kipler
    const bp = smooth(0.3, 0.4, p) * (1 - smooth(0.62, 0.72, p));
    const cf = smooth(0.62, 0.72, p);
    const lines = Math.max(bp, 0.3 * cf);
    const solid = 1 - 0.85 * bp; // yapılandırıcıda gövde dolu: renk ve malzeme net okunur, kenar çizgisi ince kalır
    const night = 0; // gece kaldırıldı (gündüz sanayi görünümü); eski değişken adı ışık ifadelerinde kullanılıyor
    const day = 1 - bp;
    scene.background.copy(DAY).lerp(NAVY, bp);
    scene.fog.color.copy(scene.background);
    scene.fog.density = 0.0065 - 0.0050 * bp;
    sheet.material.opacity = bp;
    ground.visible = bp < 0.99;
    lanes.visible = ground.visible;
    bokeh.visible = false;
    blob.material.opacity = 0.45 * day;
    setOpacity(grid, 0.12 * cf);
    setOpacity(wall, 0.5 * bp);
    lineMat.opacity = lines;
    bloom.strength = 0.04;
    scene.environmentIntensity = 0.75 + 0.1 * bp;
    hemi.intensity = 0.7 * day + 0.5 * bp;
    moon.intensity = 1.3 * day;
    mats.forEach((m) => { m.transparent = m.userData.t || solid < 0.995; m.opacity = (m.userData.o ?? 1) * solid; m.depthWrite = solid > 0.6; });

    // çekici: ilk perdede ayrılıp yola gider; önce iniş ayakları iner
    const prev = off;
    off += (target - off) * (reduced ? 1 : 1 - Math.exp(-dt * 6));
    tractor.position.set(0, 0, lengthNow / 2 - GEOMETRY.kingpinSetback + off);
    tractor.visible = off < 85;
    const lk = smooth(0.02, 0.09, p);
    if (trailer.userData.landing.userData.foot) setLanding(trailer, lk); else trailer.userData.landing.visible = lk > 0.5;
    const spin = (off - prev) / 0.5;
    tractor.userData.wheels.forEach((w) => { w.rotation.x += spin; });
    tractor.userData.beams.forEach((b) => { b.intensity = 0; });
    key.intensity = 520 * (0.3 + 0.7 * day);
    fill.intensity = 0.5 * day + 0.4 * bp;
    rimL.intensity = 0;
    if (renderer.shadowMap.enabled && (lk !== landK || (tractor.visible && off !== prev))) renderer.shadowMap.needsUpdate = true;
    landK = lk;

    // kamera
    const k = first || reduced ? 1 : 1 - Math.exp(-dt * 5);
    first = false;
    cur.pos.lerp(goal.pos, k); cur.tgt.lerp(goal.tgt, k); cur.up.lerp(goal.up, k); cur.fov += (goal.fov - cur.fov) * k;
    camera.position.copy(cur.pos);
    camera.up.copy(cur.up).normalize();
    camera.lookAt(cur.tgt);
    camera.fov = cur.fov;
    // yapılandırıcı paneline yer aç: yatayda sola, dikeyde yukarı kaydır
    // çizim perdesinde yatay ekranda başlığa yer açmak için aşağı kaydır
    const hero = 1 - smooth(0.06, 0.16, p); // açılışta araç sağda, başlık solda
    camera.setViewOffset(W, H, camera.aspect >= 1 ? W * (0.13 * cf - 0.22 * hero) : 0, (camera.aspect < 1 ? H * (0.2 * cf + 0.27 * hero) : -0.1 * H * bp), W, H);
    camera.updateMatrixWorld();

    if (bp > 0.02 || cf > 0.02) {
      svg.style.setProperty('--dim', String(Math.max(smooth(0.33, 0.4, p) * (1 - smooth(0.6, 0.66, p)), cf * (view === 'yan' ? 1 : 0))));
      if (view === 'yan' || bp > 0.02) dims();
    } else svg.style.setProperty('--dim', '0');
    composer.render();
    return true;
  }

  resize();
  setConfig(initial);
  return {
    update, resize, setConfig,
    setView(v) { if (VIEWS[v]) { view = v; dirty = true; } },
    get config() { return cfg; },
    get ready() { return !!trailer; },
    get info() { return { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, quality, source: canvas.dataset.model }; },
    renderer, scene,
    invalidate() { dirty = true; },
    // React yeniden bağlanınca (Strict Mode, sayfa geçişi) kaynaklar bırakılır
    dispose() { stopResize(); composer.dispose?.(); renderer.dispose(); },
  };
}
