// Gerçek 3D modelleri buraya bağla. null = koda gömülü örnek model kullanılır.
// Dosyayı public/models/ altına koy ve yolunu yaz. Kısa biçim:  duz: '/models/duz.glb'
// Ayrıntılı biçim: duz: { url: '/models/duz.glb', rotateY: 90, paint: /boya|paint/i }
//   rotateY : model +z'ye bakmıyorsa derece cinsinden düzeltme
//   paint   : yapılandırıcı rengi bu ada uyan malzemelere uygulanır (varsayılan: paint, boya, body, govde)
//   length  : hedef uzunluk (m). Treylerde yapılandırıcıdaki uzunluk, çekicide 6,3 m kullanılır.
// Beklenen: zemin y=0 olacak şekilde otomatik oturtulur, uzunluğa göre ölçeklenir.
// İsteğe bağlı düğüm adları: "wheel/teker" (dingil ölçüleri), "landing/ayak" (iniş ayakları), "kingpin".
// Deneme: herhangi bir sayfada ?glb=/models/dosya.glb ile config'e dokunmadan önizlenir.
export const MODELS = {
  truck: null,
  duz: null,
  tenteli: null,
  tanker: null,
  kasa: null,
  lowbed: null,
  damper: null,
};

const preview = (() => {
  const u = new URLSearchParams(globalThis.location?.search ?? '').get('glb');
  return u && /^\/models\/[\w./-]+\.(glb|gltf)$/i.test(u) && !u.includes('..') ? u : null;
})();

// slug için model tanımı: { url, rotateY, paint, length } ya da null
export function modelFor(slug) {
  const m = slug !== 'truck' && preview ? preview : MODELS[slug];
  if (!m) return null;
  return typeof m === 'string' ? { url: m } : m;
}

// Tanımlı bir model varsa yükleyip sahneye hazır örneğini döndürür, yoksa null.
// GLTF yükleyici yalnızca bu durumda indirilir.
export async function overrideFor(slug, opts) {
  const spec = modelFor(slug);
  if (!spec) return null;
  const { instantiate } = await import('./override.js');
  return instantiate(spec, opts);
}
