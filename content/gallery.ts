// Galeri içeriği. Müşteri fotoğrafları gelince: dosyayı public/img/galeri/ altına koyun, src ve baslik yazın, shot satırını silin.
// shot: görselin 3D sahneden üretildiği açı (npm run stills bu listeyi okur). Gerçek fotoğrafta gerekmez.
// tip: filtre etiketi (ürün slug'ı ya da 'detay').
export const GALLERY = [
  { src: 'cekici-duz.jpg', tip: 'duz', baslik: 'Çekici ve düz platform treyler', shot: { model: 'rig', az: 0.78, el: 0.09, dist: 1.42 } },
  { src: 'duz-arka.jpg', tip: 'duz', baslik: 'Düz platform, arka görünüş', shot: { slug: 'duz', az: 2.5, el: 0.14, dist: 0.95 } },
  { src: 'duz-yan.jpg', tip: 'duz', baslik: 'Düz platform, yan görünüş', shot: { slug: 'duz', az: 1.5708, el: 0.03, dist: 1.0, ty: 1.6 } },
  { src: 'tenteli-on.jpg', tip: 'tenteli', baslik: 'Tenteli treyler', shot: { slug: 'tenteli', az: 0.8, el: 0.12, dist: 1.0, ty: 2.1 } },
  { src: 'tenteli-arka.jpg', tip: 'tenteli', baslik: 'Tenteli, arka kapılar', shot: { slug: 'tenteli', az: 2.75, el: 0.1, dist: 0.8, ty: 2.1 } },
  { src: 'tanker-on.jpg', tip: 'tanker', baslik: 'Paslanmaz tanker', shot: { slug: 'tanker', az: 0.9, el: 0.14, dist: 1.0, ty: 2.0 } },
  { src: 'tanker-ust.jpg', tip: 'tanker', baslik: 'Tanker, üst yürüyüş yolu ve rögar kapakları', shot: { slug: 'tanker', az: 2.2, el: 0.55, dist: 0.62, ty: 3.2, tz: -2 } },
  { src: 'kasa-on.jpg', tip: 'kasa', baslik: 'Kapalı kasa treyler', shot: { slug: 'kasa', az: 0.85, el: 0.1, dist: 1.0, ty: 2.1 } },
  { src: 'kasa-kapi.jpg', tip: 'kasa', baslik: 'Kapalı kasa, kilit çubukları ve menteşeler', shot: { slug: 'kasa', az: 2.9, el: 0.06, dist: 0.5, ty: 2.2, tz: -6 } },
  { src: 'lowbed-on.jpg', tip: 'lowbed', baslik: 'Lowbed treyler', shot: { slug: 'lowbed', az: 0.9, el: 0.2, dist: 0.95, ty: 1.0 } },
  { src: 'lowbed-rampa.jpg', tip: 'lowbed', baslik: 'Lowbed, hidrolik rampalar', shot: { slug: 'lowbed', az: 2.6, el: 0.22, dist: 0.6, ty: 0.9, tz: -5 } },
  { src: 'damper-on.jpg', tip: 'damper', baslik: 'Damper treyler', shot: { slug: 'damper', az: 0.9, el: 0.2, dist: 1.0, ty: 2.0 } },
  { src: 'detay-dingil.jpg', tip: 'detay', baslik: 'Dingil grubu, hava süspansiyonu ve çamurluklar', shot: { slug: 'duz', az: 1.95, el: 0.04, dist: 0.36, ty: 0.75, tz: -4.2 } },
  { src: 'detay-ayak.jpg', tip: 'detay', baslik: 'İniş ayakları ve yan koruma', shot: { slug: 'duz', az: 1.2, el: 0.05, dist: 0.36, ty: 0.8, tz: 3.4 } },
];

export const GALLERY_TAGS = [['tum', 'Tümü'], ['duz', 'Düz platform'], ['tenteli', 'Tenteli'], ['tanker', 'Tanker'], ['kasa', 'Kapalı kasa'], ['lowbed', 'Lowbed'], ['damper', 'Damper'], ['detay', 'Detay']];
