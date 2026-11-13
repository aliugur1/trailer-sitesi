import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { overrideFor } from './models.config.js';
import { buildFlatbed, buildCurtain, buildTanker, buildLowbed, buildTipper, buildBox, buildTractor, couple } from './trailers.js';

// rig: çekici + düz platform (ana sayfa görseli için)
const rigModel = () => { const g = new THREE.Group(); const r = couple(buildTractor(), buildFlatbed()); r.position.z = 4.35; g.add(r); return g; };
const BUILD = { duz: buildFlatbed, tenteli: buildCurtain, tanker: buildTanker, lowbed: buildLowbed, damper: buildTipper, kasa: buildBox, rig: rigModel };
const FRAME = { rig: { dist: 1.45, az: 0.78, el: 0.07 } };

function radial(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// still: sabit açı, otomatik dönme yok (ürün küçük resimleri ve galeri için)
// frame: { dist, az, el, ty, tz } ile kamera açısı ve hedef noktası değiştirilebilir
export function mountViewer(host, slug, { still = false, frame = /** @type {Record<string, number> | null} */ (null) } = {}) {
  const canvas = document.createElement('canvas');
  host.append(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: still });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;
  const key = new THREE.DirectionalLight(0xfff0dc, 2.4);
  key.position.set(8, 12, 10);
  const rim = new THREE.DirectionalLight(0x6f8cff, 1.6);
  rim.position.set(-10, 6, -8);
  scene.add(key, rim);

  const model = BUILD[slug]();
  scene.add(model);
  // gerçek model tanımlıysa (models.config.js) örnek modelin yerine geçer
  if (slug !== 'rig') {
    overrideFor(slug, { length: 13.6 }).then((glb) => {
      if (!glb) return;
      scene.remove(model);
      scene.add(glb);
      host.dataset.model = 'glb';
    }).catch((e) => console.warn(`Model yüklenemedi (${slug}), örnek model kullanılıyor`, e));
  }
  host.dataset.model = 'procedural';

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 16), new THREE.MeshBasicMaterial({ map: radial('rgba(0,0,0,0.85)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  scene.add(shadow);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  const controls = new OrbitControls(camera, canvas);
  const f = { dist: 1, az: 1.0, el: 0.17, ty: 1.9, tz: 0, ...FRAME[slug], ...frame };
  controls.target.set(0, f.ty, f.tz);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.autoRotate = !still && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  controls.autoRotateSpeed = 0.9;
  controls.minDistance = still ? 1 : 12;
  controls.maxDistance = 42;
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.enabled = !still;

  const place = () => {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const d = 17.5 * f.dist / Math.min(1, camera.aspect / 1.4);
    const { az, el } = f;
    camera.position.set(Math.sin(az) * d * Math.cos(el), f.ty + Math.sin(el) * d, f.tz + Math.cos(az) * d * Math.cos(el));
    camera.updateProjectionMatrix();
    controls.update();
  };
  const ro = new ResizeObserver(place);
  ro.observe(host);
  place();

  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(host);
  renderer.setAnimationLoop(() => {
    if (!visible && !still) return;
    controls.update();
    renderer.render(scene, camera);
    host.dataset.ready = '1';
  });
  // React yeniden bağlanınca (Strict Mode) çift tuval kalmasın
  return () => { renderer.setAnimationLoop(null); ro.disconnect(); io.disconnect(); controls.dispose(); renderer.dispose(); canvas.remove(); };
}
