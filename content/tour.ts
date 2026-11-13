// Ürünler sayfasındaki sinematik tur: bölümler sırayla ekrana gelir, kamera araçların çevresinde gezer.
// free: 3D sahnede ilgili aracı "360° İncele" ile açan odak numarası (lib/three/scene.js FOCUS).
export interface TourSection {
  id?: string; side: 'left' | 'right';
  title: string; lead?: string; specs?: [string, string][]; list?: string[];
  free?: number; slug?: string; cta?: 'quote' | 'all';
}
export const TOUR_HERO = { kicker: 'Ürünler', title: ['Treylerleri', 'yolda görün.'] as [string, string], lead: 'Altı ürün ailesini sinematik 3D turla gezin, istediğiniz modeli döndürüp yakından inceleyin.' };
export const TOUR: TourSection[] = [
  { id: 'duz', side: 'right', title: 'Düz Platform', lead: 'Konteyner, inşaat malzemesi ve ağır makine. Her yük için sağlam bir zemin.', specs: [['Uzunluk', '13,6 m'], ['Dingil', '3 adet'], ['Taşıma', '39 ton']], free: 1, slug: 'duz' },
  { side: 'left', title: 'Detayda mühendislik', list: ['Yüksek dayanımlı çelik şasi', 'Hava süspansiyon ve disk fren', 'LED aydınlatma ve yansıtıcı şeritler'] },
  { id: 'tanker', side: 'right', title: 'Tanker', lead: 'Akaryakıt ve kimyasal taşımada paslanmaz, sızdırmaz ve güvenli.', specs: [['Hacim', '36.000 L'], ['Gövde', 'Paslanmaz'], ['Hazne', '3 adet']], free: 3, slug: 'tanker' },
  { side: 'left', title: 'Güvenli boşaltım', list: ['Arka vana dolabı ve hortum yuvası', 'Üst yürüyüş yolu ve rögar kapakları', 'Hazneler arası basınç dengeleme'] },
  { id: 'kasa', side: 'right', title: 'Kapalı Kasa', lead: 'Yükünüz yağmurdan, tozdan ve gözlerden korunur. Her mevsim, her yol.', specs: [['Hacim', '92 m³'], ['İç yükseklik', '2,7 m'], ['Kapı', '270° arka']], free: 5, slug: 'kasa' },
  { side: 'left', title: 'Kasa içi ve kapılar', list: ['Kilitli çift kanatlı arka kapı', 'Oluklu yan panel, hafif ve sağlam', 'Kurumsal renk ve logo uygulaması'] },
  { side: 'left', title: 'Tek çatı, altı treyler.', lead: 'Tenteli, lowbed ve damper dahil tüm seri aynı üretim disipliniyle çıkar.', cta: 'all' },
  { side: 'left', title: 'Hangisi size uygun?', lead: 'Yükünüzü anlatın, doğru treylerleri birlikte seçelim.', cta: 'quote' },
];
