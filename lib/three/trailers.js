import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GEOMETRY, axlePositions, kingpinZ } from '../../content/configurator';
import { SITE } from '../../content/site';

// Ölçüler metre. Treyler yerel orijini: gövde merkezi, zemin y=0, ön taraf +z.
// Her üretici parçaları tek tek kurar, sonda bake() aynı malzemeli parçaları tek ağda birleştirir
// (çizim çağrısı sayısı malzeme sayısına iner) ve teknik çizim için kenar geometrisini çıkarır.
export const L = 13.6;
const LDEF = 13.6;
export const W = GEOMETRY.width;
export const DECK = 1.25;
const FLOOR = GEOMETRY.deckHeight + 0.04; // zemin üst kotu

// ---------- dokular (tohumlu rastgele: her açılışta aynı sonuç) ----------
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function canvasTex(w, h, draw, { srgb = false, repeat } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  t.anisotropy = 8;
  return t;
}
// fırçalanmış paslanmaz: yatay ince çizikler (pürüzlülük haritası)
const brushedTex = canvasTex(256, 256, (x, w, h) => {
  const r = rng(7);
  x.fillStyle = '#b4b4b4'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) {
    const v = 120 + r() * 120;
    x.fillStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.4})`;
    x.fillRect(r() * w, r() * h, 30 + r() * 180, 1);
  }
}, { repeat: [3, 6] });
// lastik: çevresel kanallar + enine dişler (kabartma haritası)
const treadTex = canvasTex(64, 256, (x, w, h) => {
  x.fillStyle = '#808080'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#fff'; x.fillRect(0, h * 0.3, w, h * 0.4);
  x.fillStyle = '#202020';
  for (const v of [0.38, 0.46, 0.54, 0.62]) x.fillRect(0, h * v - 3, w, 6);
  for (const v of [0.31, 0.66]) x.fillRect(0, h * v, w * 0.45, h * 0.035);
  x.fillStyle = '#a0a0a0';
  for (const v of [0.12, 0.84]) x.fillRect(0, h * v, w * 0.5, h * 0.04); // yanak yazısı izi
}, { repeat: [40, 1] });
const plankTex = canvasTex(512, 512, (x) => {
  const r = rng(3);
  for (let i = 0; i < 10; i++) {
    const v = 70 + r() * 30;
    x.fillStyle = `rgb(${v + 30},${v + 12},${v - 14})`;
    x.fillRect(0, i * 51.2, 512, 50);
    for (let k = 0; k < 40; k++) {
      x.fillStyle = `rgba(0,0,0,${r() * 0.12})`;
      x.fillRect(r() * 512, i * 51.2 + r() * 50, 60 + r() * 200, 1);
    }
  }
}, { srgb: true, repeat: [1, 3] });
// tente: dikey yumuşak kıvrımlar
const tarpTex = canvasTex(512, 32, (x, w, h) => {
  const r = rng(11);
  const img = x.createImageData(w, h);
  for (let i = 0; i < w; i++) {
    const v = 128 + 70 * Math.sin((i / w) * Math.PI * 2 * 8) + 30 * Math.sin((i / w) * Math.PI * 2 * 21 + 1) + (r() - 0.5) * 14;
    for (let j = 0; j < h; j++) img.data.set([v, v, v, 255], (j * w + i) * 4);
  }
  x.putImageData(img, 0, 0);
}, { repeat: [3, 1] });
const plateTex = canvasTex(520, 110, (x, w, h) => {
  x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#1b3f9c'; x.fillRect(0, 0, 46, h);
  x.fillStyle = '#111'; x.font = '700 78px Arial, sans-serif'; x.textBaseline = 'middle';
  x.fillText('00 NT 000', 70, h / 2 + 4);
  x.strokeStyle = '#111'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6);
}, { srgb: true });

function logoDecal(ink) {
  // marka adı content/site.ts'ten gelir: ilk sözcük mürekkep renginde, kalanı sarı; uzun ad doku genişliğine sığacak kadar küçülür
  const [first, ...rest] = SITE.ad.toUpperCase().split(' ');
  const second = rest.join(' ');
  const draw = (x, w, h) => {
    x.clearRect(0, 0, w, h);
    let size = 88;
    const font = () => { x.font = `800 ${size}px Archivo, "Arial Black", sans-serif`; };
    font();
    while (size > 36 && x.measureText(`${first} ${second}`).width > w - 40) { size -= 4; font(); }
    x.fontStretch = 'expanded';
    x.textBaseline = 'middle';
    x.fillStyle = ink;
    x.fillText(first, 20, 105);
    x.fillStyle = '#ffc400';
    x.fillText(second, 20 + x.measureText(`${first} `).width, 105);
  };
  const t = canvasTex(1024, 200, draw, { srgb: true });
  // yazı tipi sonradan yüklenirse dokuyu yeniden çiz
  document.fonts?.load('800 88px Archivo').then(() => { draw(t.image.getContext('2d'), 1024, 200); t.needsUpdate = true; }).catch(() => {});
  return t;
}
const logos = {};
const logoMat = (ink) => (logos[ink] ??= Object.assign(std({ map: logoDecal(ink), transparent: true, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2 }), { userData: { noShadow: true } }));

// ---------- malzemeler ----------
function std(o) { return new THREE.MeshStandardMaterial(o); }
function phys(o) { return new THREE.MeshPhysicalMaterial(o); }
export const M = {
  frame: std({ color: 0x15171a, metalness: 0.55, roughness: 0.58 }),
  steel: std({ color: 0x4a5057, metalness: 0.85, roughness: 0.42 }),
  galv: std({ color: 0x8d949b, metalness: 0.75, roughness: 0.52 }),
  alu: std({ color: 0xb9bfc6, metalness: 0.9, roughness: 0.36 }),
  chrome: std({ color: 0xdfe3e8, metalness: 1, roughness: 0.16 }),
  rubber: std({ color: 0x0d0d0e, roughness: 0.9, bumpMap: treadTex, bumpScale: 1.6 }),
  rim: std({ color: 0xc4c9cf, metalness: 0.95, roughness: 0.3 }),
  black: std({ color: 0x0b0c0d, metalness: 0.2, roughness: 0.62, side: THREE.DoubleSide }),
  glass: phys({ color: 0x05080c, roughness: 0.05, clearcoat: 1, metalness: 0.3 }),
  paint: phys({ color: 0xf0b400, metalness: 0.25, roughness: 0.4, clearcoat: 1, clearcoatRoughness: 0.1 }), // çekici kabini: marka sarısı
  white: phys({ color: 0xe9edf0, metalness: 0.1, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.25 }),
  whiteRib: phys({ color: 0xd3d9de, metalness: 0.2, roughness: 0.45 }),
  roof: std({ color: 0xc9cdd1, roughness: 0.75 }),
  stainless: std({ color: 0xb9bec4, metalness: 1, roughness: 0.5, envMapIntensity: 0.8, roughnessMap: brushedTex, bumpMap: brushedTex, bumpScale: 0.25 }),
  wood: std({ map: plankTex, roughness: 0.78 }),
  accent: std({ color: 0xffc400, metalness: 0.2, roughness: 0.45 }),
  hazard: std({ color: 0xff7a00, roughness: 0.5 }),
  tapeY: std({ color: 0xffd21a, roughness: 0.4, emissive: 0xffc400, emissiveIntensity: 0.12 }),
  tapeR: std({ color: 0xd3121c, roughness: 0.4, emissive: 0xd3121c, emissiveIntensity: 0.14 }),
  plate: std({ map: plateTex, roughness: 0.5 }),
  // lambalar: bloom eşiğinin biraz üstünde kalır, patlamaz
  amber: std({ color: 0x331a00, emissive: 0xff9a1f, emissiveIntensity: 1.5 }),
  red: std({ color: 0x300000, emissive: 0xff1e1e, emissiveIntensity: 1.4 }),
  lamp: std({ color: 0x55585c, emissive: 0xffffff, emissiveIntensity: 0.25 }),
  head: std({ color: 0x222018, emissive: 0xfff1d0, emissiveIntensity: 2.6 }),
};

const paints = new Map();
export function paintMat(color) {
  if (color == null) return M.frame;
  if (!paints.has(color)) paints.set(color, phys({ color, metalness: 0.45, roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.12 }));
  return paints.get(color);
}
const bodies = new Map();
const bodyMat = (color) => (color == null ? M.white : bodies.get(color) ?? bodies.set(color, phys({ color, metalness: 0.12, roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.22 })).get(color));
const tarps = new Map();
function tarpMat(color, L) {
  const k = `${color}|${L.toFixed(1)}`;
  if (!tarps.has(k)) {
    if (tarps.size > 24) { tarps.forEach((m) => { m.bumpMap.dispose(); m.dispose(); }); tarps.clear(); }
    const bump = tarpTex.clone();
    bump.repeat.set(L / 4.5, 1);
    tarps.set(k, phys({ color, roughness: 0.62, sheen: 0.4, sheenRoughness: 0.6, bumpMap: bump, bumpScale: 2.2 }));
  }
  return tarps.get(k);
}

// ---------- geometri yardımcıları ----------
const shared = (geo) => { geo.userData.shared = true; return geo; };
const RB = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 3, r);
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const CYL_X = (r, len, seg = 20) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2);
const CYL_Y = (r, len, seg = 20) => new THREE.CylinderGeometry(r, r, len, seg);
const CYL_Z = (r, len, seg = 24) => new THREE.CylinderGeometry(r, r, len, seg).rotateX(Math.PI / 2);
const put = (parent, geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
};
// küçük ayrıntı: teknik çizimde kenar çizgisi üretmez
const dot = (...a) => { const m = put(...a); m.userData.noEdge = true; return m; };

const plain = (geo) => {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
  return g;
};
const lineGeo = (arrays) => {
  const n = arrays.reduce((s, a) => s + a.length, 0);
  const pos = new Float32Array(n);
  let o = 0;
  for (const a of arrays) { pos.set(a, o); o += a.length; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return g;
};

// Kökün altındaki sabit ağları malzemeye göre birleştirir. userData.dynamic işaretli alt gruplar (tekerlek, iniş ayağı) dışarıda kalır.
const _m = new THREE.Matrix4(), _inv = new THREE.Matrix4();
function bake(root) {
  root.updateMatrixWorld(true);
  _inv.copy(root.matrixWorld).invert();
  const byMat = new Map(), edges = [], dead = [];
  const visit = (o) => {
    if (o !== root && o.userData.dynamic) return;
    if (o.isMesh) {
      _m.multiplyMatrices(_inv, o.matrixWorld);
      const geo = plain(o.geometry).applyMatrix4(_m);
      if (!byMat.has(o.material)) byMat.set(o.material, []);
      byMat.get(o.material).push(geo);
      if (!o.userData.noEdge && o.geometry.attributes.position.count < 6000) {
        const e = new THREE.EdgesGeometry(o.geometry, 28).applyMatrix4(_m);
        edges.push(e.attributes.position.array);
        e.dispose();
      }
      dead.push(o);
    }
    [...o.children].forEach(visit);
  };
  visit(root);
  dead.forEach((o) => { o.removeFromParent(); if (!o.geometry.userData.shared) o.geometry.dispose(); });
  [...root.children].forEach((c) => { if (c.isGroup && !c.userData.dynamic && !c.children.length) root.remove(c); });
  for (const [mat, list] of byMat) {
    const mesh = new THREE.Mesh(mergeGeometries(list), mat);
    list.forEach((g) => g.dispose());
    mesh.castShadow = !mat.userData.noShadow;
    mesh.receiveShadow = true;
    root.add(mesh);
  }
  root.userData.edgeGeo = lineGeo(edges);
  return root;
}

// ---------- tekerlek (simetrik: iki yüzü de jant) ----------
const TYRE_R = 0.5;
const lathe = (pts, seg) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const tyreRaw = lathe([[0.29, -0.13], [0.36, -0.15], [0.45, -0.155], [0.485, -0.14], [0.5, -0.11], [0.5, 0.11], [0.485, 0.14], [0.45, 0.155], [0.36, 0.15], [0.29, 0.13]], 44);
const rimRaw = lathe([[0, -0.15], [0.09, -0.15], [0.1, -0.11], [0.17, -0.11], [0.27, -0.04], [0.3, -0.14], [0.3, 0.14], [0.27, 0.04], [0.17, 0.11], [0.1, 0.11], [0.09, 0.15], [0, 0.15]], 36);
const { wheelDarkGeo, wheelMetalGeo, wheelEdgeGeo } = (() => {
  const metal = [plain(rimRaw)], dark = [plain(tyreRaw)];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    for (const s of [-1, 1]) metal.push(plain(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 6).translate(Math.cos(a) * 0.135, s * 0.122, Math.sin(a) * 0.135)));
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    for (const s of [-1, 1]) dark.push(plain(new THREE.SphereGeometry(0.034, 10, 6).scale(1, 0.25, 1).translate(Math.cos(a) * 0.222, s * 0.076, Math.sin(a) * 0.222)));
  }
  const rot = (g) => shared(g.rotateZ(Math.PI / 2));
  const e1 = new THREE.EdgesGeometry(tyreRaw, 28), e2 = new THREE.EdgesGeometry(rimRaw, 28);
  return {
    wheelDarkGeo: rot(mergeGeometries(dark)),
    wheelMetalGeo: rot(mergeGeometries(metal)),
    wheelEdgeGeo: rot(lineGeo([e1.attributes.position.array, e2.attributes.position.array])),
  };
})();

function makeWheel(wheels) {
  const g = new THREE.Group();
  g.userData.dynamic = true;
  const spin = new THREE.Group();
  g.add(spin);
  put(spin, wheelDarkGeo, M.rubber).castShadow = true;
  put(spin, wheelMetalGeo, M.rim);
  spin.userData.edgeGeo = wheelEdgeGeo;
  wheels.push(spin);
  return g;
}

function axle(parent, wheels, z, track, dual) {
  put(parent, CYL_X(0.065, track * 2), M.frame, 0, TYRE_R, z);
  for (const s of [-1, 1]) {
    for (const x of dual ? [track, track - 0.33] : [track]) {
      const w = makeWheel(wheels);
      w.position.set(s * x, TYRE_R, z);
      parent.add(w);
    }
  }
}

// çamurluk: teker üstünde yay + arka paçalık
function mudguard(parent, x, z, width = 0.7, flap = true) {
  const arc = new THREE.CylinderGeometry(0.6, 0.6, width, 20, 1, true, Math.PI / 2 - 1.25, 2.5).rotateZ(Math.PI / 2);
  put(parent, arc, M.black, x, TYRE_R, z);
  if (flap) dot(parent, B(width - 0.06, 0.42, 0.015), M.black, x, 0.36, z - 0.6);
}

// hava süspansiyonu: askı braketi, salıncak kolu, körük, amortisör, fren körüğü
function suspension(g, z) {
  for (const s of [-1, 1]) {
    put(g, B(0.1, 0.34, 0.26), M.frame, s * 0.55, 0.72, z + 0.56);
    const arm = put(g, B(0.07, 0.1, 0.86), M.frame, s * 0.55, 0.56, z + 0.14);
    arm.rotation.x = 0.13;
    put(g, CYL_Y(0.15, 0.24, 18), M.black, s * 0.55, 0.72, z - 0.3);
    dot(g, CYL_Y(0.165, 0.025, 18), M.steel, s * 0.55, 0.845, z - 0.3);
    const shock = dot(g, CYL_Y(0.03, 0.5, 8), M.steel, s * 0.47, 0.68, z + 0.22);
    shock.rotation.x = -0.5;
    dot(g, CYL_X(0.085, 0.16, 14), M.steel, s * 0.3, TYRE_R + 0.02, z + 0.17);
  }
}

// ---------- iniş ayakları: üst gövde sabit, alt ayak userData.foot ile iner ----------
function landingGear(g, z, yTop = 1.2) {
  const landing = new THREE.Group();
  landing.userData.dynamic = true;
  const foot = new THREE.Group();
  foot.userData.dynamic = true;
  for (const s of [-1, 1]) {
    put(landing, B(0.12, 0.62, 0.12), M.steel, s * 0.92, yTop - 0.31, z);
    const brace = put(landing, B(0.03, 0.05, 0.62), M.steel, s * 0.92, yTop - 0.3, z - 0.26);
    brace.rotation.x = -0.75;
    put(foot, B(0.085, yTop - 0.58, 0.085), M.galv, s * 0.92, (yTop - 0.52) / 2 + 0.03, z);
    put(foot, B(0.3, 0.03, 0.26), M.steel, s * 0.92, 0.015, z);
  }
  put(landing, B(0.03, 0.05, 1.84), M.steel, 0, yTop - 0.52, z).rotation.y = Math.PI / 2;
  put(landing, B(0.16, 0.18, 0.14), M.frame, 1.04, yTop - 0.2, z); // dişli kutusu
  dot(landing, CYL_X(0.014, 0.22, 8), M.chrome, 1.2, yTop - 0.2, z);
  dot(landing, B(0.014, 0.26, 0.014), M.chrome, 1.3, yTop - 0.32, z);
  bake(foot);
  landing.add(foot);
  bake(landing);
  landing.userData.foot = foot;
  landing.userData.travel = 0.36;
  g.add(landing);
  return landing;
}
// k: 0 toplanmış (çekiciye bağlı), 1 yerde
export function setLanding(trailer, k) {
  const l = trailer.userData.landing;
  if (l?.userData.foot) l.userData.foot.position.y = l.userData.travel * (1 - Math.min(1, Math.max(0, k)));
}

// arka: tampon, lamba grupları, plaka, kırmızı şerit
function rearEnd(g, zr, yBar = 0.92, width = W) {
  put(g, RB(width - 0.2, 0.12, 0.1, 0.02), M.galv, 0, 0.5, zr + 0.14);
  for (const s of [-1, 1]) put(g, B(0.06, 0.5, 0.08), M.frame, s * 0.6, 0.76, zr + 0.2);
  put(g, B(width - 0.08, 0.17, 0.06), M.frame, 0, yBar, zr + 0.05);
  for (const s of [-1, 1]) {
    dot(g, RB(0.2, 0.11, 0.03, 0.01), M.red, s * (width / 2 - 0.2), yBar, zr + 0.012);
    dot(g, RB(0.1, 0.11, 0.03, 0.01), M.amber, s * (width / 2 - 0.37), yBar, zr + 0.012);
    dot(g, RB(0.1, 0.11, 0.03, 0.01), M.lamp, s * (width / 2 - 0.49), yBar, zr + 0.012);
    dot(g, B(0.42, 0.05, 0.006), M.tapeR, s * (width / 2 - 0.86), yBar, zr + 0.018);
  }
  const plate = dot(g, new THREE.PlaneGeometry(0.52, 0.11), M.plate, 0, yBar, zr + 0.015);
  plate.rotation.y = Math.PI;
}

// ---------- ortak treyler şasesi ----------
function baseTrailer(g, L = LDEF, axles = 3, paint = M.frame, { landingZ = L / 2 - GEOMETRY.landingFromFront, rave = true } = {}) {
  const wheels = [];
  const neck = 3.3; // ön kısımda şasi alçalır (çekici boşluğu)
  const zr = -L / 2, zf = L / 2;
  for (const s of [-1, 1]) {
    put(g, B(0.16, 0.03, L - 0.1), paint, s * 0.55, 1.235, 0);                         // üst flanş
    put(g, B(0.025, 0.4, L - neck - 0.1), paint, s * 0.55, 1.02, -neck / 2);           // gövde (arka)
    put(g, B(0.16, 0.03, L - neck - 0.2), paint, s * 0.55, 0.82, -neck / 2 - 0.05);    // alt flanş
    put(g, B(0.025, 0.16, neck), paint, s * 0.55, 1.14, zf - neck / 2 - 0.05);         // gövde (boyun)
    put(g, B(0.16, 0.03, neck - 0.3), paint, s * 0.55, 1.06, zf - neck / 2 + 0.1);
    const ramp = put(g, B(0.16, 0.03, 0.42), paint, s * 0.55, 0.94, zf - neck + 0.1);
    ramp.rotation.x = -0.6;
  }
  for (let z = zr + 0.5; z < zf; z += 1.1) {
    put(g, B(1.1, 0.1, 0.06), M.frame, 0, 1.17, z);
    if (rave) for (const s of [-1, 1]) put(g, B(0.66, 0.07, 0.05), M.frame, s * 0.9, 1.19, z);
  }
  if (rave) {
    for (const s of [-1, 1]) {
      put(g, B(0.06, 0.15, L), paint, s * (W / 2 - 0.03), 1.21, 0);
      dot(g, B(0.006, 0.05, L - 0.7), M.tapeY, s * (W / 2 + 0.002), 1.21, 0);
      for (let z = zr + 1; z < zf - 1; z += 2.6) dot(g, B(0.02, 0.04, 0.12), M.amber, s * (W / 2 + 0.004), 1.11, z);
    }
    put(g, B(W, 0.15, 0.06), paint, 0, 1.21, zr + 0.03);
    put(g, B(W, 0.15, 0.06), paint, 0, 1.21, zf - 0.03);
    dot(g, B(W - 0.4, 0.05, 0.006), M.tapeR, 0, 1.21, zr - 0.002);
  }

  const axleZ = axlePositions(L, axles);
  axleZ.forEach((z, i) => {
    axle(g, wheels, z, 1.1, true);
    suspension(g, z);
    for (const s of [-1, 1]) mudguard(g, s * 0.935, z, 0.7, i === 0);
  });

  // yan koruma, hava tüpleri, takım sandığı, stepne (dingiller ile iniş ayakları arasında)
  const z0 = axleZ[axles - 1] + 0.82, z1 = landingZ - 0.45, span = z1 - z0;
  if (span > 1.2) {
    const zc = (z0 + z1) / 2;
    for (const s of [-1, 1]) {
      for (const y of [0.52, 0.8]) put(g, B(0.03, 0.11, span), M.alu, s * (W / 2 - 0.06), y, zc);
      for (const k of [0.12, 0.5, 0.88]) put(g, B(0.04, 0.72, 0.04), M.frame, s * (W / 2 - 0.1), 0.82, z0 + span * k);
    }
    for (const k of [-1, 1]) put(g, CYL_X(0.15, 0.62, 18), M.galv, k * 0.02, 0.66, z0 + 0.35 + (k + 1) * 0.19);
    if (span > 2.6) put(g, RB(0.62, 0.42, 0.56, 0.04), M.black, -0.84, 0.66, z1 - 0.5);
    if (span > 3.4) {
      const spare = new THREE.Group();
      put(spare, wheelDarkGeo, M.rubber);
      put(spare, wheelMetalGeo, M.rim).userData.noEdge = true;
      spare.rotation.z = Math.PI / 2;
      spare.position.set(0.1, 0.6, zc + 0.5);
      g.add(spare);
    }
  }

  const landing = landingGear(g, landingZ);

  put(g, B(1.14, 0.02, 2.0), M.steel, 0, 1.035, zf - 1.15);                           // sürtünme plakası
  put(g, CYL_Y(0.045, 0.14, 14), M.chrome, 0, 0.96, kingpinZ(L));                     // kingpin
  dot(g, RB(0.5, 0.2, 0.05, 0.015), M.black, 0, 1.12, zf + 0.01);                     // hava ve elektrik bağlantı paneli
  for (const [x, m] of [[-0.14, M.tapeR], [0, M.lamp], [0.14, M.tapeY]]) dot(g, CYL_Z(0.028, 0.05, 10), m, x, 1.12, zf + 0.04);

  rearEnd(g, zr);
  Object.assign(g.userData, { wheels, landing, axleZ, kingpinZ: kingpinZ(L), length: L });
  return g;
}

// arka kapı çifti: çerçeve, kilit çubukları, menteşeler
function rearDoors(g, z, y0, H, mat) {
  const yc = y0 + H / 2;
  put(g, B(W - 0.02, 0.1, 0.09), M.steel, 0, y0 + H - 0.05, z);
  put(g, B(W - 0.02, 0.1, 0.09), M.steel, 0, y0 + 0.05, z);
  for (const s of [-1, 1]) {
    put(g, B(0.09, H, 0.09), M.steel, s * (W / 2 - 0.055), yc, z);
    put(g, RB(W / 2 - 0.12, H - 0.22, 0.04, 0.012), mat, s * (W / 4 - 0.03), yc, z - 0.03);
    for (const x of [0.32, 0.86]) {
      put(g, CYL_Y(0.016, H - 0.16, 8), M.chrome, s * x, yc, z - 0.075);
      for (const y of [y0 + 0.12, y0 + H - 0.12]) dot(g, B(0.07, 0.05, 0.04), M.steel, s * x, y, z - 0.07);
      dot(g, B(0.26, 0.028, 0.02), M.chrome, s * (x + 0.1), y0 + 1.0, z - 0.095);
    }
    for (let i = 0; i < 4; i++) dot(g, B(0.05, 0.12, 0.05), M.steel, s * (W / 2 - 0.12), y0 + 0.3 + i * ((H - 0.6) / 3), z - 0.055);
  }
  dot(g, B(W - 0.3, 0.05, 0.006), M.tapeR, 0, y0 + 0.05, z - 0.048);
}

// ---------- düz platform ----------
export function buildFlatbed(o = {}) {
  const L = o.L ?? LDEF;
  const paint = paintMat(o.color);
  const g = new THREE.Group();
  baseTrailer(g, L, o.axles ?? 3, paint);
  put(g, B(W - 0.12, 0.06, L - 0.12), M.wood, 0, FLOOR - 0.03, 0);

  // açılır alüminyum kapaklar: dikmeler arasında üç profilli panel
  const n = Math.max(3, Math.round((L - 0.2) / 2.25)), sec = (L - 0.2) / n, hb = 0.6;
  for (const s of [-1, 1]) {
    for (let i = 0; i <= n; i++) {
      const z = -L / 2 + 0.1 + i * sec;
      put(g, B(0.07, hb + 0.12, 0.09), paint, s * (W / 2 - 0.035), FLOOR + (hb + 0.12) / 2, z);
      if (i < n) {
        for (let k = 0; k < 3; k++) put(g, B(0.03, hb / 3 - 0.008, sec - 0.11), M.alu, s * (W / 2 - 0.03), FLOOR + 0.03 + (k + 0.5) * (hb / 3), z + sec / 2);
        for (const e of [0.1, sec - 0.1]) dot(g, B(0.02, 0.1, 0.05), M.chrome, s * (W / 2 - 0.008), FLOOR + hb - 0.08, z + e);
        dot(g, new THREE.TorusGeometry(0.04, 0.01, 6, 12), M.chrome, s * (W / 2 + 0.012), 1.13, z + sec / 2);
      }
    }
  }
  for (let k = 0; k < 3; k++) put(g, B(W - 0.16, hb / 3 - 0.008, 0.03), M.alu, 0, FLOOR + 0.03 + (k + 0.5) * (hb / 3), -L / 2 + 0.05);
  // ön duvar
  const hh = 1.6, zh = L / 2 - 0.07;
  for (const s of [-1, 1]) put(g, B(0.09, hh + 0.06, 0.09), paint, s * (W / 2 - 0.045), FLOOR + hh / 2, zh);
  for (let k = 0; k < 8; k++) put(g, B(W - 0.18, hh / 8 - 0.008, 0.035), M.alu, 0, FLOOR + (k + 0.5) * (hh / 8), zh);
  put(g, B(W, 0.07, 0.1), paint, 0, FLOOR + hh + 0.03, zh);
  for (const x of [-0.6, 0.6]) put(g, B(0.06, hh, 0.05), paint, x, FLOOR + hh / 2, zh - 0.045);
  return bake(g);
}

// ---------- tanker ----------
export function buildTanker(o = {}) {
  const L = o.L ?? LDEF;
  const paint = paintMat(o.color);
  const k = L / LDEF;
  const g = new THREE.Group();
  baseTrailer(g, L, o.axles ?? 3, paint, { rave: false });
  const h = L / 2 - 0.6, cy = 2.42, rx = 1.25, ry = 1.05;
  const pts = [];
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI / 2; pts.push(new THREE.Vector2(Math.sin(a), -h - 0.45 * Math.cos(a))); }
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a), h + 0.45 * Math.sin(a))); }
  const tank = put(g, new THREE.LatheGeometry(pts, 64).rotateX(Math.PI / 2), M.stainless, 0, cy, 0);
  tank.scale.set(rx, ry, 1);
  const band = (z, tube, mat) => { const r = put(g, new THREE.TorusGeometry(1, tube, 6, 64), mat, 0, cy, z); r.scale.set(rx + tube, ry + tube, 1); return r; };
  for (const z of [-4.2 * k, -1.4 * k, 1.4 * k, 4.2 * k]) band(z, 0.024, M.steel);            // takviye çemberleri
  for (let z = -h + 0.3; z < h; z += 1.4 * k) band(z + 0.7 * k, 0.007, M.alu).userData.noEdge = true; // kaynak dikişleri
  for (const z of [-5 * k, -2.8 * k, 0, 2.8 * k, 5 * k]) {
    put(g, B(1.5, 0.14, 0.2), paint, 0, 1.32, z);
    for (const s of [-1, 1]) put(g, B(0.3, 0.3, 0.2), paint, s * 0.72, 1.46, z).rotation.z = s * 0.55;
  }
  // rögar kapakları
  for (const z of [-3.6 * k, 0, 3.6 * k]) {
    put(g, CYL_Y(0.3, 0.16, 28), M.steel, 0, cy + ry + 0.05, z);
    put(g, CYL_Y(0.27, 0.04, 28), M.chrome, 0, cy + ry + 0.15, z);
    for (let i = 0; i < 6; i++) dot(g, B(0.04, 0.05, 0.06), M.steel, Math.cos(i * 1.047) * 0.29, cy + ry + 0.14, z + Math.sin(i * 1.047) * 0.29);
    dot(g, CYL_Y(0.05, 0.1, 10), M.chrome, 0.16, cy + ry + 0.2, z + 0.4);
  }
  // üst yürüyüş yolu ve korkuluk
  const wl = L - 3.4, wx = 0.62, wy = cy + ry - 0.02;
  put(g, B(0.42, 0.03, wl), M.alu, wx, wy, 0);
  for (let z = -wl / 2 + 0.1; z <= wl / 2; z += 0.22) dot(g, B(0.42, 0.006, 0.02), M.steel, wx, wy + 0.018, z);
  for (let z = -wl / 2; z <= wl / 2 + 0.01; z += wl / 6) {
    put(g, CYL_Y(0.016, 0.5, 8), M.galv, wx + 0.2, wy + 0.25, z);
    dot(g, B(0.05, 0.12, 0.05), M.steel, wx, wy - 0.07, z);
  }
  for (const y of [0.25, 0.5]) put(g, CYL_Z(0.016, wl, 8), M.galv, wx + 0.2, wy + y, 0);
  // arka merdiven
  const zl = -L / 2 + 0.1;
  for (const x of [0.42, 0.82]) put(g, CYL_Y(0.02, wy - 1.25, 8), M.galv, x, (wy + 1.3) / 2, zl);
  for (let y = 1.55; y < wy; y += 0.3) dot(g, CYL_X(0.014, 0.4, 6), M.galv, 0.62, y, zl);
  // hortum taşıyıcıları, vana dolabı, boşaltım hattı
  for (const s of [-1, 1]) {
    put(g, CYL_Z(0.085, 5.4 * k, 16), M.alu, s * 1.08, 1.36, 0.4);
    dot(g, CYL_Z(0.092, 0.05, 16), M.black, s * 1.08, 1.36, 0.4 - 2.7 * k);
  }
  put(g, RB(1.1, 0.62, 0.3, 0.03), paint, -0.45, 1.58, -L / 2 + 0.2);
  const az = g.userData.axleZ, zv = az[az.length - 1] + 1.6;
  put(g, CYL_Z(0.05, 2.2, 12), M.stainless, -0.86, 1.02, zv + 0.9);
  for (let i = 0; i < 3; i++) {
    put(g, CYL_X(0.045, 0.22, 12), M.chrome, -0.98, 1.02, zv + i * 0.9);
    dot(g, new THREE.TorusGeometry(0.06, 0.012, 6, 14), M.tapeR, -1.1, 1.02, zv + i * 0.9).rotation.y = Math.PI / 2;
  }
  for (const z of [L / 2 - 0.02, -L / 2 + 0.03]) dot(g, B(0.4, 0.3, 0.012), M.hazard, z > 0 ? 0 : -0.62, z > 0 ? 1.5 : 1.16, z);
  return bake(g);
}

// ---------- kapalı kasa ----------
export function buildBox(o = {}) {
  const L = o.L ?? LDEF;
  const g = new THREE.Group();
  baseTrailer(g, L, o.axles ?? 3, paintMat(o.color));
  const body = bodyMat(o.color);
  const H = 2.66, Lb = L - 0.16, y0 = FLOOR - 0.04, zc = 0.03;
  put(g, RB(W - 0.06, H, Lb, 0.03), body, 0, y0 + H / 2, zc);
  for (const s of [-1, 1]) {
    for (const y of [y0 + 0.06, y0 + H - 0.06]) put(g, B(0.03, 0.12, Lb), M.alu, s * (W / 2 - 0.015), y, zc);
    for (let z = -Lb / 2 + 0.6; z < Lb / 2 - 0.3; z += 0.6) put(g, B(0.012, H - 0.24, 0.05), M.whiteRib, s * (W / 2 - 0.024), y0 + H / 2, z + zc);
    put(g, B(0.012, 0.16, Lb - 0.3), M.accent, s * (W / 2 - 0.022), y0 + 0.55, zc);
    const decal = dot(g, new THREE.PlaneGeometry(5, 0.98), logoMat('#12202e'), s * (W / 2 - 0.012), y0 + 1.6, zc);
    decal.rotation.y = s * Math.PI / 2;
  }
  for (const s of [-1, 1]) put(g, B(0.06, H, 0.06), M.alu, s * (W / 2 - 0.03), y0 + H / 2, L / 2 - 0.05);
  rearDoors(g, -L / 2 + 0.07, y0, H, body);
  return bake(g);
}

// ---------- tenteli ----------
export function buildCurtain(o = {}) {
  const L = o.L ?? LDEF;
  const g = new THREE.Group();
  baseTrailer(g, L, o.axles ?? 3, paintMat(o.color));
  const H = 2.66, y0 = FLOOR - 0.04, Lc = L - 0.36;
  const tarp = tarpMat(o.color ?? 0x1f4f86, L);
  put(g, B(W - 0.12, 0.06, L - 0.12), M.wood, 0, FLOOR - 0.03, 0);
  put(g, RB(W - 0.04, H, 0.08, 0.02), M.white, 0, y0 + H / 2, L / 2 - 0.06);             // ön duvar
  put(g, B(W - 0.06, 0.06, L - 0.1), M.roof, 0, y0 + H - 0.01, 0);                        // çatı
  for (const s of [-1, 1]) {
    put(g, B(0.07, 0.13, L - 0.06), M.alu, s * (W / 2 - 0.035), y0 + H - 0.07, 0);        // üst ray
    put(g, B(0.02, H - 0.02, Lc), tarp, s * (W / 2 - 0.045), y0 + H / 2 - 0.08, -0.02);   // tente
    for (let z = -Lc / 2 + 0.35; z < Lc / 2 - 0.2; z += 0.62) {
      put(g, B(0.008, H - 0.2, 0.045), M.whiteRib, s * (W / 2 - 0.032), y0 + H / 2 - 0.02, z);
      dot(g, B(0.02, 0.09, 0.06), M.chrome, s * (W / 2 - 0.026), y0 - 0.1, z);
    }
    for (const z of [-Lc / 2 - 0.02, Lc / 2 - 0.02]) put(g, CYL_Y(0.03, H - 0.1, 10), M.alu, s * (W / 2 - 0.04), y0 + H / 2, z);
    const decal = dot(g, new THREE.PlaneGeometry(5, 0.98), logoMat('#ffffff'), s * (W / 2 - 0.026), y0 + 1.65, 0);
    decal.rotation.y = s * Math.PI / 2;
  }
  rearDoors(g, -L / 2 + 0.07, y0, H, M.white);
  return bake(g);
}

// ---------- lowbed ----------
export function buildLowbed() {
  const g = new THREE.Group();
  const wheels = [];
  const deckLen = L - 3.6, deckZ = -L / 2 + deckLen / 2;
  for (const s of [-1, 1]) {
    put(g, B(0.18, 0.3, deckLen), M.frame, s * 0.7, 0.72, deckZ);
    put(g, B(0.06, 0.2, deckLen), M.frame, s * (W / 2 - 0.03), 0.8, deckZ);
    dot(g, B(0.006, 0.05, deckLen - 0.6), M.tapeY, s * (W / 2 + 0.002), 0.8, deckZ);
    for (let z = -L / 2 + 1.2; z < L / 2 - 3.8; z += 1.4) dot(g, new THREE.TorusGeometry(0.05, 0.012, 6, 12), M.chrome, s * (W / 2 + 0.014), 0.86, z);
  }
  put(g, B(W - 0.12, 0.08, deckLen), M.wood, 0, 0.9, deckZ);
  // kuğu boynu
  for (const s of [-1, 1]) {
    const rise = put(g, B(0.2, 0.34, 1.5), M.frame, s * 0.7, 1.02, L / 2 - 3.1);
    rise.rotation.x = -0.42;
    put(g, B(0.2, 0.3, 2.5), M.frame, s * 0.7, 1.3, L / 2 - 1.25);
  }
  put(g, B(1.6, 0.06, 2.5), M.steel, 0, 1.47, L / 2 - 1.25);
  put(g, B(1.14, 0.02, 1.8), M.steel, 0, 1.14, L / 2 - 1.0);
  put(g, CYL_Y(0.045, 0.14, 14), M.chrome, 0, 1.06, L / 2 - 1.0);
  const axleZ = [0, 1, 2, 3].map((i) => -L / 2 + 1.3 + i * 1.25);
  axleZ.forEach((z, i) => { axle(g, wheels, z, 1.08, true); for (const s of [-1, 1]) mudguard(g, s * 0.915, z, 0.7, i === 0); });
  // hidrolik rampalar
  for (const s of [-1, 1]) {
    const ramp = new THREE.Group();
    put(ramp, B(0.72, 0.07, 2.4), M.steel);
    for (let z = -1.05; z <= 1.05; z += 0.3) dot(ramp, B(0.72, 0.025, 0.04), M.galv, 0, 0.045, z);
    ramp.position.set(s * 0.62, 0.55, -L / 2 - 1.1);
    ramp.rotation.x = -0.3;
    g.add(ramp);
    put(g, CYL_Y(0.05, 0.9, 10), M.chrome, s * 0.62, 0.5, -L / 2 - 0.3).rotation.x = 0.9;
  }
  rearEnd(g, -L / 2, 0.62);
  const landing = landingGear(g, L / 2 - 3.6, 0.86);
  Object.assign(g.userData, { wheels, landing, axleZ, kingpinZ: L / 2 - 1.0, length: L });
  return bake(g);
}

// ---------- damper ----------
export function buildTipper() {
  const g = new THREE.Group();
  baseTrailer(g, L, 3, M.frame, { rave: false });
  const Lt = L - 1.0;
  const body = phys({ color: 0x59636e, metalness: 0.7, roughness: 0.4, clearcoat: 0.3, side: THREE.DoubleSide });
  put(g, new THREE.CylinderGeometry(1.27, 1.27, Lt, 40, 1, true, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2), body, 0, 2.62, 0);
  for (const s of [-1, 1]) {
    put(g, B(0.06, 0.55, Lt), body, s * 1.27, 2.9, 0);
    put(g, B(0.1, 0.08, Lt), M.steel, s * 1.27, 3.2, 0);
    put(g, B(0.02, 0.14, Lt - 0.6), M.accent, s * 1.31, 2.9, 0);
    put(g, B(0.14, 0.16, Lt - 1), M.frame, s * 0.55, 1.33, 0); // alt şase
  }
  for (let z = -Lt / 2 + 0.6; z < Lt / 2; z += 1.9) {
    const rib = put(g, new THREE.TorusGeometry(1.3, 0.04, 8, 32, Math.PI), M.steel, 0, 2.62, z);
    rib.rotation.z = Math.PI;
  }
  put(g, B(W, 1.9, 0.1), body, 0, 2.35, Lt / 2);
  put(g, B(W - 0.1, 1.55, 0.08), body, 0, 2.12, -Lt / 2);
  put(g, B(W, 0.1, 0.12), M.steel, 0, 3.2, -Lt / 2);
  for (const s of [-1, 1]) dot(g, CYL_X(0.05, 0.1, 10), M.steel, s * (W / 2 - 0.06), 3.05, -Lt / 2 - 0.02);
  const ram = put(g, CYL_Y(0.09, 1.6, 16), M.chrome, 0, 1.95, L / 2 - 1.6);
  ram.rotation.x = 0.45;
  put(g, CYL_Y(0.13, 0.7, 16), M.steel, 0, 1.55, L / 2 - 2.0).rotation.x = 0.45;
  return bake(g);
}

// ---------- çekici (4x2, kabin üstü). Orijin: beşinci teker ----------
export function buildTractor() {
  const g = new THREE.Group();
  const wheels = [];
  const zF = 3.15, zR = -0.55, front = 4.6, back = 2.2, hw = 1.24;
  for (const s of [-1, 1]) put(g, B(0.09, 0.24, 5.5), M.frame, s * 0.42, 0.82, 1.25);
  for (const z of [-1.3, 0.6, 1.9]) put(g, B(0.84, 0.12, 0.08), M.frame, 0, 0.82, z);
  put(g, B(0.8, 0.1, 0.62), M.frame, 0, 0.97, 0);
  put(g, CYL_Y(0.47, 0.045, 28), M.steel, 0, 1.012, 0.02);                              // beşinci teker
  dot(g, B(0.12, 0.05, 0.4), M.black, 0, 1.014, -0.34);

  axle(g, wheels, zF, 1.04, false);
  axle(g, wheels, zR, 1.1, true);
  for (const s of [-1, 1]) {
    mudguard(g, s * 0.935, zR, 0.72, true);
    put(g, B(0.72, 0.03, 0.5), M.black, s * 0.935, 1.1, zR);
    dot(g, RB(0.2, 0.1, 0.03, 0.01), M.red, s * 0.86, 0.78, -1.52);
    dot(g, RB(0.1, 0.1, 0.03, 0.01), M.amber, s * 0.68, 0.78, -1.52);
  }
  put(g, B(2.0, 0.14, 0.05), M.frame, 0, 0.78, -1.5);
  // yakıt deposu (sağ), akü ve AdBlue kutuları (sol)
  put(g, CYL_Z(0.31, 1.25, 24), M.alu, 0.98, 0.66, 1.25);
  for (const z of [0.85, 1.65]) dot(g, new THREE.TorusGeometry(0.315, 0.014, 6, 24), M.black, 0.98, 0.66, z);
  dot(g, CYL_Y(0.05, 0.05, 10), M.black, 1.0, 0.985, 1.55);
  put(g, RB(0.5, 0.56, 0.72, 0.04), M.black, -0.98, 0.66, 1.62);
  put(g, RB(0.5, 0.46, 0.46, 0.04), M.frame, -0.98, 0.62, 0.92);

  // kabin gövdesi: yan profil, genişlik boyunca uzatılır (kenarlar pahlı)
  const shape = new THREE.Shape();
  [[back, 1.04], [3.78, 1.04], [3.78, 0.5], [front - 0.04, 0.5], [front, 1.5], [front - 0.02, 2.22], [front - 0.2, 3.32], [front - 0.42, 3.62], [3.3, 3.96], [back, 3.96]]
    .forEach(([z, y], i) => (i ? shape.lineTo(z, y) : shape.moveTo(z, y)));
  const cab = new THREE.ExtrudeGeometry(shape, { depth: hw * 2 - 0.16, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelOffset: -0.07, bevelSegments: 3, curveSegments: 4 });
  cab.rotateY(-Math.PI / 2).translate(hw - 0.08, 0, 0);
  put(g, cab, M.paint);

  // ön yüz
  const tilt = -Math.atan2(0.18, 1.1);
  const ws = put(g, RB(2.18, 1.02, 0.03, 0.012), M.glass, 0, 2.77, front - 0.1);
  ws.rotation.x = tilt;
  const visor = put(g, RB(2.36, 0.2, 0.34, 0.03), M.black, 0, 3.4, front - 0.12);
  visor.rotation.x = 0.25;
  put(g, RB(1.76, 0.78, 0.04, 0.015), M.black, 0, 1.6, front + 0.0);
  for (let y = 1.3; y < 1.95; y += 0.13) dot(g, B(1.66, 0.03, 0.02), M.steel, 0, y, front + 0.022);
  dot(g, RB(0.5, 0.11, 0.02, 0.008), M.chrome, 0, 2.09, front + 0.005);
  put(g, RB(2.46, 0.3, 0.12, 0.04), M.black, 0, 0.66, front - 0.02);                    // tampon
  dot(g, new THREE.PlaneGeometry(0.52, 0.11), M.plate, 0, 0.66, front + 0.045);
  for (const s of [-1, 1]) {
    put(g, RB(0.5, 0.24, 0.05, 0.02), M.glass, s * 0.93, 1.0, front - 0.005);            // far yuvası
    dot(g, RB(0.3, 0.07, 0.02, 0.008), M.head, s * 0.98, 0.98, front + 0.024);
    dot(g, B(0.42, 0.018, 0.02), M.lamp, s * 0.93, 1.09, front + 0.024);
    dot(g, B(0.12, 0.05, 0.02), M.amber, s * 1.16, 0.9, front + 0.02);
    dot(g, CYL_Z(0.05, 0.03, 12), M.lamp, s * 0.82, 0.66, front + 0.04);
    // yan camlar, kapı çizgisi, kol, şerit
    put(g, RB(0.03, 0.74, 0.98, 0.012), M.glass, s * (hw - 0.002), 2.76, 3.82);
    for (const z of [3.2, 4.38]) dot(g, B(0.012, 1.9, 0.012), M.black, s * hw, 2.1, z);
    dot(g, B(0.012, 0.012, 1.18), M.black, s * hw, 1.16, 3.79);
    dot(g, B(0.03, 0.04, 0.16), M.chrome, s * (hw + 0.006), 2.2, 3.34);
    dot(g, B(0.012, 0.07, 2.1), M.frame, s * hw, 1.86, 3.3);
    // basamaklar ve ön çamurluk
    put(g, RB(0.2, 0.46, 0.66, 0.03), M.black, s * (hw - 0.1), 0.72, 4.12);
    for (const y of [0.56, 0.84]) dot(g, B(0.06, 0.02, 0.5), M.galv, s * (hw + 0.01), y, 4.12);
    mudguard(g, s * 1.0, zF, 0.5, false);
    // aynalar
    put(g, RB(0.07, 0.56, 0.2, 0.025), M.black, s * (hw + 0.24), 2.86, front - 0.2);
    put(g, RB(0.07, 0.2, 0.18, 0.02), M.black, s * (hw + 0.24), 2.42, front - 0.2);
    for (const y of [2.5, 3.08]) dot(g, CYL_X(0.014, 0.26, 6), M.black, s * (hw + 0.12), y, front - 0.2);
    // kabin yan rüzgârlıkları
    put(g, B(0.03, 2.5, 0.42), M.paint, s * (hw - 0.03), 2.6, back - 0.2);
  }
  for (const x of [-0.72, -0.36, 0, 0.36, 0.72]) dot(g, B(0.09, 0.035, 0.05), M.amber, x, 3.66, front - 0.5);
  put(g, B(2.3, 0.04, 0.6), M.paint, 0, 3.98, back - 0.05).rotation.x = 0.12;             // tavan rüzgârlığı
  // kabin arkası: hava hortumları
  for (const [x, m] of [[-0.12, M.tapeR], [0.12, M.tapeY]]) {
    const pts = [];
    for (let i = 0; i <= 40; i++) pts.push(new THREE.Vector3(x + Math.cos(i * 1.3) * 0.045, 1.9 - i * 0.012, back - 0.1 - i * 0.012 + Math.sin(i * 1.3) * 0.045));
    dot(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.009, 5), m);
  }

  // far ışıkları
  const beams = [];
  for (const s of [-1, 1]) {
    const sp = new THREE.SpotLight(0xfff0d2, 170, 70, 0.4, 0.8, 1.6);
    sp.position.set(s * 0.95, 1.0, front + 0.1);
    sp.target.position.set(s * 1.4, 0.2, front + 40);
    g.add(sp, sp.target);
    beams.push(sp);
  }
  bake(g);
  g.userData.wheels = wheels;
  g.userData.beams = beams;
  return g;
}

// çekiciyi treylere bağlar: beşinci teker orijin, treyler arkada
export function couple(tractor, trailer, Lt = LDEF) {
  trailer.position.set(0, 0, -(Lt / 2 - GEOMETRY.kingpinSetback));
  setLanding(trailer, 0);
  const rig = new THREE.Group();
  rig.add(tractor, trailer);
  rig.userData.wheels = [...tractor.userData.wheels, ...trailer.userData.wheels];
  rig.userData.beams = tractor.userData.beams;
  return rig;
}
