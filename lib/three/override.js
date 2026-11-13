import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GEOMETRY } from '../../content/configurator';

// Bu modül yalnızca bir GLB tanımlıysa yüklenir (dinamik import). Draco çözücü three ile birlikte paketlenir, CDN gerekmez.
const loader = new GLTFLoader().setDRACOLoader(new DRACOLoader());
const cache = new Map();
const PAINT = /paint|boya|body|g[oö]vde/i;
const WHEEL = /wheel|teker/i;
const LANDING = /landing|ayak/i;

// Dosyayı bir kez indirir; yön düzeltilir, x/z ortalanır, zemin y=0'a oturtulur.
export function loadModel(spec) {
  if (!cache.has(spec.url)) {
    cache.set(spec.url, loader.loadAsync(spec.url).then(({ scene }) => {
      const root = new THREE.Group();
      scene.rotation.y = THREE.MathUtils.degToRad(spec.rotateY ?? 0);
      root.add(scene);
      const box = new THREE.Box3().setFromObject(root);
      const c = box.getCenter(new THREE.Vector3());
      scene.position.set(-c.x, -box.min.y, -c.z);
      root.userData.size = box.getSize(new THREE.Vector3());
      root.traverse((m) => {
        if (!m.isMesh) return;
        m.geometry.userData.shared = true; // örnekler arasında ortak, sahne değişiminde silinmez
        m.castShadow = m.receiveShadow = true;
      });
      return root;
    }));
  }
  return cache.get(spec.url);
}

const edgeOf = (geo) => {
  if (geo.userData.edge === undefined) {
    geo.userData.edge = geo.attributes.position.count < 60000 ? new THREE.EdgesGeometry(geo, 28) : null;
    if (geo.userData.edge) geo.userData.edge.userData.shared = true;
  }
  return geo.userData.edge;
};

// Önbellekteki modelden sahneye konacak bir örnek üretir. Kodla üretilen treylerlerle aynı userData sözleşmesini verir.
export async function instantiate(spec, { length, color } = {}) {
  const proto = await loadModel(spec);
  const g = proto.clone(true);
  const L = spec.length ?? length ?? proto.userData.size.z;
  g.scale.setScalar(L / proto.userData.size.z);
  const mats = new Map();
  const wheels = [];
  let landing = null, kp = null;
  g.updateMatrixWorld(true);
  const p = new THREE.Vector3();
  g.traverse((o) => {
    if (WHEEL.test(o.name) && !wheels.some((w) => w === o.parent)) wheels.push(o);
    if (!landing && LANDING.test(o.name)) landing = o;
    if (!kp && /kingpin/i.test(o.name)) kp = o;
    if (!o.isMesh) return;
    const own = (m) => {
      if (!mats.has(m)) {
        const c = m.clone();
        if (color != null && (spec.paint ?? PAINT).test(m.name)) c.color.set(color);
        mats.set(m, c);
      }
      return mats.get(m);
    };
    o.material = Array.isArray(o.material) ? o.material.map(own) : own(o.material);
    const e = edgeOf(o.geometry);
    if (e) o.userData.edgeGeo = e;
  });
  const zOf = (o) => Math.round(p.setFromMatrixPosition(o.matrixWorld).z * 100) / 100;
  Object.assign(g.userData, {
    source: 'glb',
    wheels,
    landing: landing ?? new THREE.Group(),
    axleZ: [...new Set(wheels.map(zOf))].sort((a, b) => a - b),
    kingpinZ: kp ? zOf(kp) : L / 2 - GEOMETRY.kingpinSetback,
    length: L,
    ownMaterials: [...mats.values()],
  });
  return g;
}
