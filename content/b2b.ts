import { SITE } from './site';
// B2B içerikleri: ürün ek verileri, kalite, fabrika, sertifikalar, servis ağı, satış sonrası, indirme merkezi.
// TÜM DEĞERLER ÖRNEKTİR. Müşteri verisi gelince yalnızca bu dosya değişir; sayfalar buradan üretilir.
// Gerçek sisteme bağlanacak yerler: lookupVin (şasi no sorgusu), DEALERS (bayi listesi), CERTS ve DOWNLOADS (belge dosyaları).

// Yüke göre hızlı bulucu: yük türü -> uygun ürünler
export const LOADS = [
  { id: 'kuru', label: 'Kuru ve paletli yük', slugs: ['tenteli', 'kasa', 'duz'] },
  { id: 'sivi', label: 'Sıvı ve kimyasal', slugs: ['tanker'] },
  { id: 'agir', label: 'Ağır yük ve iş makinesi', slugs: ['lowbed', 'duz'] },
  { id: 'dokme', label: 'Hafriyat ve dökme yük', slugs: ['damper'] },
  { id: 'konteyner', label: 'Konteyner ve çelik', slugs: ['duz'] },
];

// Ürün ek verileri (slug ile site.js PRODUCTS'a bağlanır)
// filtre: listeleme filtreleri. uc: kartta görünen üç değer. cizim: teknik çizim ölçüleri (m).
export const EXTRA = {
  duz: {
    kod: 'NT-DP 13', filtre: { dingil: 3, fren: 'disk', sasi: 'standart', kapasite: 39 },
    uc: [['Dara', '6.200 kg'], ['Azami yük', '39 t'], ['Zemin yüksekliği', '1.340 mm']],
    cizim: { L: 13.6, axles: 3, H: 3.0, sekil: 'platform' },
    sekmeler: [
      ['Şasi ve dingil', [['Şasi çeliği', 'S700 MC'], ['Dingil', '3 x 9 t, hava süspansiyon'], ['Dingil kaldırma', 'Ön dingil, isteğe bağlı'], ['Kingpin', '2 inç, değiştirilebilir']]],
      ['Üst yapı', [['Kapaklar', 'Alüminyum, 600 mm, açılır'], ['Ön duvar', 'Alüminyum profil, 1.600 mm'], ['Dikmeler', 'Sökülebilir çelik']]],
      ['Fren ve elektrik', [['Fren', 'Disk, EBS 2S/2M'], ['Sürüş güvenliği', 'RSS devrilme önleme'], ['Aydınlatma', 'LED, 24 V, 15 pin']]],
      ['Zemin ve güvenlik', [['Zemin', '28 mm su kontrası'], ['Forklift dingil yükü', '7.200 kg'], ['Yük emniyeti', 'Ankraj halkaları, 2 t']]],
    ],
  },
  tenteli: {
    kod: 'NT-TN 13 Mega', filtre: { dingil: 3, fren: 'disk', sasi: 'mega', kapasite: 27 },
    uc: [['Dara', '6.400 kg'], ['Hacim', '100 m³'], ['İç yükseklik', '3.000 mm']],
    cizim: { L: 13.6, axles: 3, H: 4.0, sekil: 'kutu' },
    sekmeler: [
      ['Şasi ve dingil', [['Şasi çeliği', 'S700 MC'], ['Dingil', '3 x 9 t, hava süspansiyon'], ['Dingil kaldırma', 'Ön dingil, standart'], ['Kingpin', '2 inç, değiştirilebilir']]],
      ['Üst yapı', [['Tente', '900 g/m² PVC, kayar'], ['Çatı', 'Kayar çatı, hidrolik kaldırma isteğe bağlı'], ['Çıtalar', 'Alüminyum, dört sıra']]],
      ['Fren ve elektrik', [['Fren', 'Disk, EBS 2S/2M'], ['Sürüş güvenliği', 'RSS devrilme önleme'], ['Aydınlatma', 'LED, 24 V, 15 pin']]],
      ['Zemin ve güvenlik', [['Zemin', '28 mm su kontrası'], ['Forklift dingil yükü', '7.200 kg'], ['Yük emniyeti', 'EN 12642 Code XL']]],
    ],
  },
  tanker: {
    kod: 'NT-TK 36', filtre: { dingil: 3, fren: 'disk', sasi: 'standart', kapasite: 30 },
    uc: [['Dara', '7.000 kg'], ['Hacim', '36.000 L'], ['Hazne', '3 adet']],
    cizim: { L: 13.3, axles: 3, H: 3.9, sekil: 'tank' },
    sekmeler: [
      ['Şasi ve dingil', [['Şasi', 'Kendinden taşıyıcı alt şase'], ['Dingil', '3 x 9 t, hava süspansiyon'], ['Kingpin', '2 inç']]],
      ['Üst yapı', [['Gövde', 'Paslanmaz çelik, 4 mm'], ['Hazne', '3 bölme, dalgakıranlı'], ['Üst donanım', 'Yürüyüş yolu, katlanır korkuluk']]],
      ['Fren ve elektrik', [['Fren', 'Disk, EBS 2S/2M'], ['Sürüş güvenliği', 'RSS devrilme önleme'], ['Elektrik', 'ADR uyumlu tesisat']]],
      ['Zemin ve güvenlik', [['Boşaltım', 'Alt boşaltım, 3 vana'], ['Emniyet', 'Basınç ve vakum valfi'], ['Onay', 'ADR tip onayı']]],
    ],
  },
  lowbed: {
    kod: 'NT-LB 4', filtre: { dingil: 4, fren: 'kampana', sasi: 'agir', kapasite: 50 },
    uc: [['Dara', '11.500 kg'], ['Azami yük', '50 t'], ['Zemin yüksekliği', '950 mm']],
    cizim: { L: 13.6, axles: 4, H: 1.5, sekil: 'lowbed' },
    sekmeler: [
      ['Şasi ve dingil', [['Şasi çeliği', 'S700 MC, kutu kesit'], ['Dingil', '4 x 12 t'], ['Dingil kaldırma', 'İlk dingil'], ['Kingpin', '3,5 inç']]],
      ['Üst yapı', [['Rampa', 'Hidrolik, çift kanatlı'], ['Genişletme', 'Yan uzatmalar, 3.000 mm'], ['Boyun', 'Sabit kuğu boynu']]],
      ['Fren ve elektrik', [['Fren', 'Kampana, EBS 4S/3M'], ['Aydınlatma', 'LED, dönerli ikaz lambası']]],
      ['Zemin ve güvenlik', [['Zemin', '50 mm sert ağaç'], ['Yük emniyeti', 'Ankraj halkaları, 8 t']]],
    ],
  },
  damper: {
    kod: 'NT-DM 28', filtre: { dingil: 3, fren: 'kampana', sasi: 'agir', kapasite: 33 },
    uc: [['Dara', '7.400 kg'], ['Hacim', '28 m³'], ['Azami yük', '33 t']],
    cizim: { L: 12.5, axles: 3, H: 3.3, sekil: 'damper' },
    sekmeler: [
      ['Şasi ve dingil', [['Şasi çeliği', 'S700 MC'], ['Dingil', '3 x 9 t'], ['Dingil kaldırma', 'Ön dingil']]],
      ['Üst yapı', [['Gövde', 'Aşınma çeliği, 5 mm taban'], ['Silindir', 'Ön teleskopik, 5 kademe'], ['Kapak', 'Hidrolik arka kapak']]],
      ['Fren ve elektrik', [['Fren', 'Kampana, EBS 2S/2M'], ['Aydınlatma', 'LED, korumalı']]],
      ['Zemin ve güvenlik', [['Devirme açısı', '45°'], ['Emniyet', 'Devirme stabilite desteği']]],
    ],
  },
  kasa: {
    kod: 'NT-KK 13', filtre: { dingil: 3, fren: 'disk', sasi: 'standart', kapasite: 27 },
    uc: [['Dara', '7.200 kg'], ['Hacim', '92 m³'], ['İç yükseklik', '2.700 mm']],
    cizim: { L: 13.6, axles: 3, H: 4.0, sekil: 'kutu' },
    sekmeler: [
      ['Şasi ve dingil', [['Şasi çeliği', 'S700 MC'], ['Dingil', '3 x 9 t, hava süspansiyon'], ['Kingpin', '2 inç']]],
      ['Üst yapı', [['Panel', 'Oluklu alüminyum'], ['Kapı', 'Çift kanat, 270°, dört kilit çubuğu'], ['Çatı', 'Tek parça, ışık geçiren isteğe bağlı']]],
      ['Fren ve elektrik', [['Fren', 'Disk, EBS 2S/2M'], ['Sürüş güvenliği', 'RSS devrilme önleme'], ['Aydınlatma', 'LED, iç aydınlatma']]],
      ['Zemin ve güvenlik', [['Zemin', '28 mm su kontrası, kaymaz'], ['Forklift dingil yükü', '7.200 kg'], ['Yük emniyeti', 'Bağlama rayları, iki sıra']]],
    ],
  },
};
// Standart donanım (ürün sayfasında opsiyonların yanında listelenir)
export const STANDARD = {
  duz: ['Tek stepnelik', 'Takoz ve takozluk', 'Çamurluk ve paçalıklar', 'Yan koruma profilleri', 'Mekanik ayak, 25 t, çift hızlı', 'LED aydınlatma grubu'],
  tenteli: ['Kayar tente ve kayar çatı', 'Dört sıra alüminyum çıta', 'Tek stepnelik', 'Takoz ve takozluk', 'Yan koruma profilleri', 'Mekanik ayak, 25 t, çift hızlı'],
  tanker: ['Üst yürüyüş yolu ve korkuluk', 'Arka merdiven', 'Hortum taşıyıcıları', 'Yangın tüpü dolabı', 'Takoz ve takozluk', 'Mekanik ayak, 25 t, çift hızlı'],
  lowbed: ['Hidrolik rampalar', 'Yan uzatma sacları', 'Dönerli ikaz lambası', 'Takoz ve takozluk', 'Bağlama zincir yuvaları', 'Mekanik ayak, 25 t, çift hızlı'],
  damper: ['Hidrolik arka kapak', 'Branda sistemi', 'Çamurluk ve paçalıklar', 'Takoz ve takozluk', 'Devirme emniyet valfi', 'Mekanik ayak, 25 t, çift hızlı'],
  kasa: ['Çift kanat arka kapı', 'İç aydınlatma', 'İki sıra bağlama rayı', 'Tek stepnelik', 'Yan koruma profilleri', 'Mekanik ayak, 25 t, çift hızlı'],
};

export const FILTERS = {
  dingil: { label: 'Dingil', options: [[2, '2 dingil'], [3, '3 dingil'], [4, '4 ve üzeri']] },
  fren: { label: 'Fren', options: [['disk', 'Disk'], ['kampana', 'Kampana']] },
  sasi: { label: 'Şasi', options: [['standart', 'Standart'], ['mega', 'Mega'], ['agir', 'Ağır hizmet']] },
  kapasite: { label: 'Taşıma kapasitesi', options: [[30, '30 t ve altı'], [40, '30 ile 40 t arası'], [99, '40 t üzeri']] },
};

export const QUALITY = [
  ['KTL kaplama', 'Şasi katodik daldırma ile kaplanır, korozyona karşı uzun ömür.'],
  ['Robot kaynak', 'Ana taşıyıcılar robot hatlarında, her dikişte aynı kalite.'],
  ['Code XL', 'Üst yapı EN 12642 Code XL yük emniyetine göre test edilir.'],
];
export const FACTORY = [
  ['Lazer kesim', 'Sac ve profiller fiber lazerde, 0,1 mm hassasiyetle kesilir.'],
  ['Robot kaynak hattı', 'Şasi kirişleri otomatik hatlarda birleştirilir.'],
  ['KTL ve boya', 'Kumlama, katodik daldırma ve çok katlı son kat boya.'],
  ['Son kontrol', 'Fren, elektrik ve sızdırmazlık testleri her araçta yapılır.'],
];
export const RND = [
  ['Hafif şasi', 'Yüksek mukavemetli çelikle daha düşük dara, daha fazla yük.'],
  ['Aerodinamik', 'Yan etekler ve arka kanatlarla yakıt tüketimi azaltılır.'],
  ['Telematik', 'Konum, lastik basıncı ve fren verisi filo sistemine aktarılır.'],
];
// dosya: public/ altındaki yol. Boşsa "talep üzerine" olarak gösterilir.
export const CERTS = [
  ['ISO 9001', 'Kalite yönetim sistemi', ''],
  ['ISO 14001', 'Çevre yönetim sistemi', ''],
  ['ECE R13', 'Fren sistemi tip onayı', ''],
  ['EN 12642 Code XL', 'Üst yapı yük emniyeti', ''],
  ['ADR', 'Tehlikeli madde taşıma onayı', ''],
  ['ATP / FRC', 'Soğutmalı taşıma onayı', ''],
];

// Servis ağı. x, y: şematik harita üzerinde yüzde konum (gerçek koordinat değildir).
export const DEALERS = [
  { ad: 'Nova Merkez Servis', sehir: 'Konya', tur: 'merkez', tel: '0 000 000 00 01', adres: 'Örnek Sanayi Mah. 1. Cadde No: 12', x: 43, y: 62 },
  { ad: 'Marmara Yetkili Servis', sehir: 'İstanbul', tur: 'servis', tel: '0 000 000 00 02', adres: 'Örnek OSB 4. Sokak No: 8', x: 24, y: 22 },
  { ad: 'Ege Yetkili Servis', sehir: 'İzmir', tur: 'servis', tel: '0 000 000 00 03', adres: 'Örnek Sanayi Sitesi B Blok', x: 12, y: 52 },
  { ad: 'Başkent Satış ve Servis', sehir: 'Ankara', tur: 'bayi', tel: '0 000 000 00 04', adres: 'Örnek Bulvarı No: 40', x: 40, y: 38 },
  { ad: 'Çukurova Yetkili Servis', sehir: 'Adana', tur: 'servis', tel: '0 000 000 00 05', adres: 'Örnek Yolu 5. km', x: 56, y: 74 },
  { ad: 'Karadeniz Satış Noktası', sehir: 'Samsun', tur: 'bayi', tel: '0 000 000 00 06', adres: 'Örnek Liman Caddesi No: 3', x: 58, y: 18 },
  { ad: 'Güneydoğu Yetkili Servis', sehir: 'Gaziantep', tur: 'servis', tel: '0 000 000 00 07', adres: 'Örnek OSB 2. Cadde No: 21', x: 66, y: 72 },
  { ad: 'Doğu Satış Noktası', sehir: 'Erzurum', tur: 'bayi', tel: '0 000 000 00 08', adres: 'Örnek Sanayi 7. Sokak', x: 82, y: 34 },
];
export const DEALER_TYPES = [['tum', 'Tümü'], ['servis', 'Yetkili servis'], ['bayi', 'Satış noktası'], ['merkez', 'Merkez']];
export const ROADSIDE = { tel: '0 000 000 00 24', href: 'tel:+900000000024' };

// Şasi numarası sorgusu. ÖRNEK: gerçek sistemde bu işlev üreticinin servisine istek atar.
const VINS = {
  NT9DP13A0R0000001: { slug: 'duz', yil: 2024, garanti: '2026-03-14', parcalar: [['Fren diski, 430 mm', 'NT-4301'], ['Hava körüğü', 'NT-2210'], ['LED stop grubu, sol', 'NT-6105'], ['Kingpin, 2 inç', 'NT-1002']] },
  NT9TK36A0P0000002: { slug: 'tanker', yil: 2023, garanti: '2025-06-01', parcalar: [['Alt boşaltım vanası', 'NT-7303'], ['Rögar contası', 'NT-7120'], ['Fren diski, 430 mm', 'NT-4301']] },
};
export const SAMPLE_VINS = Object.keys(VINS);
export async function lookupVin(vin: string) { return (VINS as Record<string, (typeof VINS)[keyof typeof VINS]>)[vin.trim().toUpperCase()] ?? null; }

export const MAINTENANCE = [
  ['İlk 5.000 km', 'Bijon torku, hava kaçağı ve fren ayarı kontrolü.'],
  ['Her 25.000 km', 'Dingil yatakları, körükler ve EBS hata kaydı kontrolü.'],
  ['Her 100.000 km', 'Fren diski ve balata, kingpin ve beşinci teker plakası ölçümü.'],
  ['Yılda bir', 'Şasi boya ve korozyon kontrolü, elektrik tesisatı testi.'],
];

// İndirme merkezi. dosya: public/ altındaki yol ya da sayfa adresi.
export const DOWNLOADS = [
  { grup: 'Kataloglar', ad: 'Ürün kataloğu (Türkçe)', tur: 'PDF', dosya: `/katalog/${SITE.slug}-katalog-tr.pdf` },
  { grup: 'Kataloglar', ad: 'Ürün kataloğu (İngilizce)', tur: 'PDF', dosya: `/katalog/${SITE.slug}-katalog-en.pdf` },
  { grup: 'Kurumsal kimlik', ad: 'Logo, vektör', tur: 'SVG', dosya: '/img/logo.svg' },
  { grup: 'Basın görselleri', ad: 'Çekici ve düz platform', tur: 'JPG', dosya: '/img/galeri/cekici-duz.jpg' },
  { grup: 'Basın görselleri', ad: 'Paslanmaz tanker', tur: 'JPG', dosya: '/img/galeri/tanker-on.jpg' },
  { grup: 'Basın görselleri', ad: 'Kapalı kasa treyler', tur: 'JPG', dosya: '/img/galeri/kasa-on.jpg' },
];

export const SALES = [
  ['İç Anadolu ve Akdeniz', 'Bölge satış müdürü', '0 000 000 00 11'],
  ['Marmara ve Ege', 'Bölge satış müdürü', '0 000 000 00 12'],
  ['İhracat', 'İhracat satış müdürü', '0 000 000 00 13'],
];
