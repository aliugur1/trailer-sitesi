import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { L, W, buildFlatbed, buildTanker, buildBox, buildTractor, couple } from './trailers.js';
import { overrideFor } from './models.config.js';

// Bloom tek yerden ayarlanır (ana sayfa sahnesi de bunu kullanır). Eşik HDR değeridir:
// yalnızca lambalar ve çok sert yansımalar parlar, boyalı ve paslanmaz yüzeyler patlamaz.
export const BLOOM = { strength: 0.18, radius: 0.3, threshold: 2.6 };

const FOG = 0x070a10;
const TANKER_X = 22;
const BOX_X = 44;

// Kamera yolu: [konum, bakış noktası]. SECTION_KEYS = bölümlere denk gelen durak indeksleri.
const v = (x, y, z) => new THREE.Vector3(x, y, z);
const HERO_T = v(0, 2.0, 2.5), TANK_T = v(TANKER_X + 4, 2.2, -0.5), BOX_T = v(BOX_X + 4, 2.3, -0.5);
export const PATH = [
  [v(-2.8, 1.35, 16.5), HERO_T],            // 0 açılış
  [v(15, 2.7, -1.5), v(-3, 1.9, -6.5)],    // 1 düz platform yan
  [v(4, 1.1, -19.5), v(0, 1.7, -12)],       // 2 düz platform arka
  [v(16, 2.0, -22), TANK_T],                // geçiş
  [v(31, 2.4, -15), TANK_T],                // geçiş
  [v(39, 2.9, 2), TANK_T],                // 5 tanker yan
  [v(25.5, 3.8, -15.5), v(TANKER_X, 2.4, -6.8)], // 6 tanker arka
  [v(36, 2.4, -17), BOX_T],                 // geçiş
  [v(58, 2.8, -12), BOX_T],                 // geçiş
  [v(63, 3.0, 3), BOX_T],                 // 9 kasa yan
  [v(47.5, 1.5, -15.5), v(BOX_X, 2.3, -6.8)], // 10 kasa arka
  [v(22, 36, 30), v(22, 0, 3.5)],            // 11 kuşbakışı
  [v(3.5, 1.2, 15), HERO_T],                // 12 final
];
export const SECTION_KEYS = [0, 1, 2, 5, 6, 9, 10, 11, 12];
// serbest inceleme için hedef nokta (bölüm indeksine göre)
export const FOCUS = { 1: v(0, 1.8, -6), 3: v(TANKER_X, 2.2, 0), 5: v(BOX_X, 2.2, 0) };

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const small = matchMedia('(max-width: 700px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(FOG);
  scene.fog = new THREE.FogExp2(FOG, 0.016);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 600);

  // ---- ışıklar ----
  scene.add(new THREE.HemisphereLight(0x5a7bb0, 0x0a0c10, 0.35));
  const moon = new THREE.DirectionalLight(0x7f9cff, 0.9);
  moon.position.set(-30, 40, -20);
  scene.add(moon);
  const stageXs = [0, TANKER_X, BOX_X];
  stageXs.forEach((x) => {
    const s = new THREE.SpotLight(0xffe2b8, 280, 60, 0.55, 1, 1.4);
    s.position.set(x + 8, 16, -14);
    s.target.position.set(x, 0, -3);
    scene.add(s, s.target);
    const rim = new THREE.PointLight(0x3d6bff, 120, 40, 1.8);
    rim.position.set(x - 6, 3, -16);
    scene.add(rim);
  });

  // ---- zemin ----
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), groundMaterial());
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const dash = dashTexture();
  for (const x of [-5.2, 5.2]) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 300), new THREE.MeshStandardMaterial({ map: dash, transparent: true, roughness: 0.5 }));
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.01, -60);
    scene.add(line);
  }

  // ---- araçlar ----
  const flatbed = buildFlatbed();
  const tractor = buildTractor();
  const rig = couple(tractor, flatbed);
  const tanker = buildTanker();
  tanker.position.x = TANKER_X;
  const box = buildBox();
  box.position.x = BOX_X;
  scene.add(rig, tanker, box);
  [[rig, 0, 17], [tanker, TANKER_X, L], [box, BOX_X, L]].forEach(([o, x, len]) => {
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(W * 2.4, len * 1.18), new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false }));
    blob.rotation.x = -Math.PI / 2;
    blob.position.set(x, 0.02, o === rig ? -4.35 : 0);
    (o === rig ? rig : scene).add(blob); // çekici girişte hareket ettiği için gölge de onunla gelir
  });

  const wheels = [...rig.userData.wheels, ...tanker.userData.wheels, ...box.userData.wheels];

  // gerçek modeller (models.config.js): yüklenince örnek modelin yerine geçer, hata olursa örnek kalır
  const swap = (group, slug, opts, keep = []) => overrideFor(slug, opts).then((model) => {
    if (!model) return;
    group.clear();
    group.add(model, ...keep);
  }).catch((e) => console.warn(`Model yüklenemedi (${slug}), örnek model kullanılıyor`, e));
  swap(flatbed, 'duz', { length: L });
  swap(tanker, 'tanker', { length: L });
  swap(box, 'kasa', { length: L });
  const { beams } = tractor.userData;
  swap(tractor, 'truck', { length: 6.3 }, [...beams, ...beams.map((b) => b.target)]);

  // ---- atmosfer ----
  const bokeh = bokehPoints();
  scene.add(bokeh);
  const dust = dustPoints();
  scene.add(dust);

  // ---- post ----
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), BLOOM.strength, BLOOM.radius, BLOOM.threshold);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.9 ? 55 : 38; // dikey ekranda yatay görüş darlaşmasın
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function update(t, dt) {
    if (!reduced) {
      const a = dust.geometry.attributes.position;
      for (let i = 0; i < a.count; i++) {
        let y = a.getY(i) + dt * 0.12;
        if (y > 9) y = 0;
        a.setY(i, y);
        a.setX(i, a.getX(i) + Math.sin(t * 0.3 + i) * dt * 0.05);
      }
      a.needsUpdate = true;
    }
    composer.render();
  }

  return { renderer, scene, camera, rig, wheels, update, resize, flatbed };
}

// ---------- yardımcı dokular ----------
export function groundMaterial() {
  const S = 1024;
  const make = (base, spread, blobs) => {
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const img = x.createImageData(S, S);
    for (let i = 0; i < S * S; i++) {
      const n = base + (Math.random() - 0.5) * spread;
      img.data.set([n, n, n, 255], i * 4);
    }
    x.putImageData(img, 0, 0);
    blobs?.(x);
    return c;
  };
  const colorC = make(34, 20);
  const roughC = make(150, 50, (x) => {
    for (let i = 0; i < 70; i++) {
      const r = 20 + Math.random() * 90;
      const px = Math.random() * S, py = Math.random() * S;
      const g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, 'rgba(25,25,25,0.95)');
      g.addColorStop(1, 'rgba(25,25,25,0)');
      x.fillStyle = g;
      x.fillRect(px - r, py - r, r * 2, r * 2);
    }
  });
  const tex = (c, srgb) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(14, 14);
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return new THREE.MeshStandardMaterial({ map: tex(colorC, true), roughnessMap: tex(roughC, false), roughness: 1, metalness: 0.15 });
}

export function dashTexture() {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#9c9c94';
  x.fillRect(0, 0, 16, 128);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 75);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function blobTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 8, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.85)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function bokehPoints() {
  const n = 90, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, r = 150 + Math.random() * 110;
    pos.set([22 + Math.cos(a) * r * 1.4, 1 + Math.random() * 7, Math.sin(a) * r], i * 3);
    c.set(Math.random() < 0.6 ? 0xffb35c : 0x6f9bff).multiplyScalar(2.2);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ size: 5, map: dotTexture(), vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
}

export function dustPoints() {
  const n = 500, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) pos.set([-12 + Math.random() * 74, Math.random() * 9, -28 + Math.random() * 56], i * 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ size: 0.07, map: dotTexture(), color: 0xcfd9ff, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
}
