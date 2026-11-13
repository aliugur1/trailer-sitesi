// Ana sayfa metinleri. Müşteri değişince yalnızca bu dosya (ve site.ts, b2b.ts) güncellenir.
export const HERO = {
  kicker: 'Treyler üreticisi · Konya',
  lead: 'Düz platform, tenteli, tanker, lowbed, damper ve kapalı kasa treyler üretiyoruz. Yükünüze göre ölçülür, sahada çalışır.',
};
export const STATS: [string, string][] = [
  ['25+', 'yıllık üretim deneyimi'], ['1.000+', 'yılda üretilen treyler'], ['30', 'ülkeye ihracat'], ['2 yıl', 'üretici garantisi'],
];
export const WHY: [string, string][] = [
  ['Sağlam şasi', 'Yüksek mukavemetli çelik, hesaplanmış yük dağılımı ve uzun yorulma ömrü.'],
  ['Sahaya göre tasarım', 'Taşıdığınız yüke, güzergâha ve filonuza göre ölçü ve donanım belirlenir.'],
  ['Titiz kalite kontrol', 'Her treyler kaynak, fren ve elektrik testlerinden geçmeden teslim edilmez.'],
  ['Satış sonrası destek', 'Yedek parça ve servis, teslimattan sonra da bir telefon uzağınızda.'],
];
export const STEPS: [string, string][] = [
  ['Tasarım', 'İhtiyacınızı ölçüye ve çizime döküyoruz.'], ['Kesim', 'Lazer ve plazma ile hassas sac işleme.'],
  ['Kaynak', 'Robot hassasiyeti ve usta eli bir arada.'], ['Boya', 'Kumlama ve çok katlı boya ile uzun ömürlü koruma.'],
  ['Teslim', 'Test, kontrol ve montajdan sonra yola çıkış.'],
];
export const FAQ: [string, string][] = [
  ['Teklif ne kadar sürede hazırlanır?', 'Talebinizi aldıktan sonra genellikle iki iş günü içinde dönüş yaparız.'],
  ['Özel ölçü ve donanım üretiyor musunuz?', 'Evet. Ölçü, dingil sayısı, zemin, renk ve logo ihtiyacınıza göre belirlenir.'],
  ['Garanti süresi nedir?', 'Şasi ve kaynak yapısı için üretici garantisi sunuyoruz. Kapsam teklifte yazılıdır.'],
  ['Teslimat nasıl yapılıyor?', 'Treyler fabrikadan teslim alınabilir ya da belirttiğiniz adrese gönderilir.'],
  ['Yedek parça ve servis var mı?', 'Evet. Satış sonrası destek ekibimiz yedek parça ve servis için telefonla ulaşılabilir.'],
];

// ---- güven katmanı (müşteriye göre doldurulur; boş bırakılan bölüm gösterilmez) ----
// İlk ekranın hemen altındaki şerit: [büyük değer, açıklama]
export const TRUST: [string, string][] = [
  ['ISO 9001', 'kalite yönetim sistemi'], ['ECE R13', 'fren sistemi tip onayı'], ['EN 12642 XL', 'yük emniyeti onayı'], ['2 yıl', 'üretici garantisi'], ['7/24', 'yol yardım hattı'],
];
// Referanslar: firma adları (gerçek müşteride logo dosyası da eklenebilir). ÖRNEK isimlerdir.
export const REFERENCES: string[] = ['Anadolu Lojistik', 'Marmara Taşımacılık', 'Ege Nakliyat', 'Karadeniz Tanker', 'Başkent Filo', 'Güney Hafriyat'];
// Yetkili mesajı. foto: public/img/ altındaki dosya adı, boşsa baş harfler gösterilir.
export const OWNER = {
  ad: 'Ad Soyad', unvan: 'Genel Müdür', foto: '',
  mesaj: 'Her treyleri, kendi filomuza çıkaracakmış gibi üretiriz. Teklifte yazan ölçü, donanım ve teslim tarihi sözümüzdür.',
};
// Fabrika fotoğrafları: {src: 'public/img/fabrika/..', baslik}. Gerçek fotoğraf gelene kadar boş: bölüm gösterilmez.
export const FACTORY_PHOTOS: { src: string; baslik: string }[] = [];

// Tanıtım filmi (ana sayfada güven şeridinin altında). src boşsa bölüm gösterilmez.
// Dosyalar public/video/ altında. Sessiz film, kendiliğinden oynamaz (oynat düğmesi). Yeni müşteride `film/` projesiyle yeniden üretilir.
export const VIDEO = {
  src: '/video/siparisten-yola.mp4', poster: '/video/siparisten-yola.jpg',
  baslik: 'Siparişten yola, 30 saniyede.',
  aciklama: 'Ölçüyü seçin, treylerinizi yapılandırın, seçiminiz tek tıkla teklife dönsün.',
};
