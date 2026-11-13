// Tüm site içeriği tek yerde. Değerler şablon örneğidir, müşteriye göre değiştirilir.
export const SITE = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ornek.com', // canonical, sitemap ve paylaşım görselleri için
  ad: 'Nova Treyler',
  slug: 'nova-treyler',   // dosya adları (katalog PDF) için
  isaret: 'nt.',          // menüdeki küçük logo işareti
  telefon: '0 000 000 00 00',
  tel: '+900000000000',
  whatsapp: '900000000000',
  eposta: 'info@ornek.com',
  adres: 'Örnek Sanayi Mah. 1. Cadde No: 12, Konya',
  saatler: 'Pazartesi - Cumartesi, 08:00 - 18:00',
  ihracat: '0 000 000 00 13',       // dış ticaret hattı
  ihracatTel: '+900000000013',
  // Sosyal hesaplar: [['Instagram', 'https://...'], ...]. Boşsa alt bilgide gösterilmez.
  sosyal: [] as [string, string][],
  // Teklif formu gönderimi: uç nokta boşsa e-posta uygulaması açılır (mailto). Dolu ise form JSON olarak POST edilir
  // (Formspree, kendi API'niz vb.). Ortam değişkeni: NEXT_PUBLIC_FORM_ENDPOINT
  form: { endpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? '' },
  // Ziyaretçi ölçümü: çerezsiz Plausible. Alan adı boşsa hiçbir ölçüm betiği yüklenmez. Ortam değişkeni: NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  analitik: { plausible: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? '' },
};

export interface Product {
  slug: string; slogan: [string, string]; meta: string; kullanim: string; etiketler: string[];
  ad: string; ozet: string; aciklama: string; gruplar: [string, [string, string][]][]; ozellikler: string[];
}
export const PRODUCTS: Product[] = [
  {
    slug: 'duz',
    slogan: ['HER YÜKÜN','SAĞLAM ZEMİNİ.'],
    meta: '13,6 m · 39 t · 3 dingil',
    kullanim: 'konteyner, çelik, yapı malzemesi',
    etiketler: ['Hava süspansiyon','Disk fren','EBS','Ankraj halkaları'],
    ad: 'Düz Platform Treyler',
    ozet: 'Konteyner, çelik ve makine taşımada sağlam, sade zemin.',
    aciklama: 'Paletli yükten yapı malzemesine, çelik profilden konteynere kadar her açık yük için tasarlandı. Ahşap veya alüminyum zemin, ankraj halkaları ve açılır bordalar yükü sabitlemeyi kolaylaştırır.',
    gruplar: [
      ['Ölçüler', [['Uzunluk', '13,6 m'], ['Genişlik', '2,55 m'], ['Dara', '6,2 t']]],
      ['Taşıma', [['Azami yük', '39 t'], ['Dingil', '3 adet'], ['Süspansiyon', 'Hava']]],
      ['Donanım', [['Fren', 'Disk, EBS'], ['Aydınlatma', 'LED'], ['Zemin', 'Ahşap veya alüminyum']]],
    ],
    ozellikler: ['Yüksek mukavemetli çelik şasi', 'Katlanır yan bordalar ve ankraj halkaları', 'Konteyner twist-lock yuvaları (isteğe bağlı)', 'Çok katlı korozyon koruması'],
  },
  {
    slug: 'tenteli',
    slogan: ['YANDAN YÜKLE,','HEMEN YOLA ÇIK.'],
    meta: '13,6 m · 92 m³ · 27 t',
    kullanim: 'paletli ve kapalı yük',
    etiketler: ['Kayar tente','PVC kaplı','Yan kayış','LED'],
    ad: 'Tenteli Treyler',
    ozet: 'Paletli yükler için hızlı açılan, yandan yüklenebilen kayar tente.',
    aciklama: 'Kayar tente sistemi yandan ve arkadan yüklemeye izin vererek bekleme süresini kısaltır. Tente tek kişiyle açılır, yük yağmurdan ve tozdan korunur.',
    gruplar: [
      ['Ölçüler', [['Uzunluk', '13,6 m'], ['Genişlik', '2,55 m'], ['İç yükseklik', '2,7 m']]],
      ['Taşıma', [['Hacim', '92 m³'], ['Azami yük', '27 t'], ['Dingil', '3 adet']]],
      ['Donanım', [['Tente', 'Kayar, PVC kaplı'], ['Bağlama', 'Yan kayış sistemi'], ['Aydınlatma', 'LED']]],
    ],
    ozellikler: ['Yandan ve arkadan hızlı yükleme', 'Yırtılmaya dayanıklı PVC tente', 'Kolay açılan kayar çatı', 'Yük bağlama için yan halkalar'],
  },
  {
    slug: 'tanker',
    slogan: ['SIVI YÜK,','SIFIR SIZINTI.'],
    meta: '36.000 L · 3 hazne · paslanmaz',
    kullanim: 'akaryakıt, kimyasal',
    etiketler: ['Paslanmaz çelik','Vana dolabı','Basınç dengeleme','Rögar'],
    ad: 'Tanker',
    ozet: 'Akaryakıt ve kimyasal taşımada paslanmaz, sızdırmaz gövde.',
    aciklama: 'Paslanmaz çelik gövde, hazneli yapı ve emniyetli boşaltım ekipmanıyla sıvı yük için üretilir. Üst yürüyüş yolu ve rögar kapakları denetimi kolaylaştırır.',
    gruplar: [
      ['Ölçüler', [['Uzunluk', '13,3 m'], ['Genişlik', '2,5 m'], ['Dara', '7,0 t']]],
      ['Taşıma', [['Hacim', '36.000 L'], ['Hazne', '3 adet'], ['Dingil', '3 adet']]],
      ['Donanım', [['Gövde', 'Paslanmaz çelik'], ['Boşaltım', 'Arka vana dolabı'], ['Güvenlik', 'Basınç dengeleme']]],
    ],
    ozellikler: ['Paslanmaz çelik gövde', 'Hazneli yapı, yükler karışmaz', 'Arka vana dolabı ve hortum yuvası', 'Üst yürüyüş yolu ve rögar kapakları'],
  },
  {
    slug: 'lowbed',
    slogan: ['AĞIR MAKİNE,','ALÇAK ZEMİN.'],
    meta: '13,6 m · 0,95 m zemin · 50 t',
    kullanim: 'iş makineleri',
    etiketler: ['Hidrolik rampa','4 dingil','Gooseneck','Disk fren'],
    ad: 'Lowbed Treyler',
    ozet: 'İş makineleri için alçak zemin ve rampa ile kolay yükleme.',
    aciklama: 'Alçak yükleme yüksekliği, yüksek makinelerin yasal ölçülere sığmasını sağlar. Hidrolik rampa ve güçlendirilmiş gooseneck yapısı ağır yükü güvenle taşır.',
    gruplar: [
      ['Ölçüler', [['Uzunluk', '13,6 m'], ['Zemin yüksekliği', '0,95 m'], ['Genişlik', '2,55 m']]],
      ['Taşıma', [['Azami yük', '50 t'], ['Dingil', '4 adet'], ['Süspansiyon', 'Hava']]],
      ['Donanım', [['Rampa', 'Hidrolik, çift kanatlı'], ['Zemin', 'Ahşap'], ['Fren', 'Disk, EBS']]],
    ],
    ozellikler: ['Alçak zemin, yüksek makineye uygun', 'Hidrolik açılır arka rampa', 'Güçlendirilmiş gooseneck', 'Çok akslı dengeli yük dağılımı'],
  },
  {
    slug: 'damper',
    slogan: ['TEK HAMLEDE,','TAM BOŞALTMA.'],
    meta: '12,5 m · 28 m³ · 33 t',
    kullanim: 'hafriyat, dökme yük',
    etiketler: ['Yarım yuvarlak gövde','Teleskopik silindir','Takviyeli sac','Hidrolik kapak'],
    ad: 'Damper Treyler',
    ozet: 'Hafriyat ve dökme yükte yarım yuvarlak gövde, güçlü hidrolik.',
    aciklama: 'Yarım yuvarlak gövde yükün tamamen boşalmasını sağlar, yapışma ve birikmeyi azaltır. Teleskopik hidrolik silindir ve takviyeli yapı ağır iş koşullarına dayanır.',
    gruplar: [
      ['Ölçüler', [['Uzunluk', '12,5 m'], ['Genişlik', '2,55 m'], ['Dara', '7,4 t']]],
      ['Taşıma', [['Hacim', '28 m³'], ['Azami yük', '33 t'], ['Dingil', '3 adet']]],
      ['Donanım', [['Gövde', 'Takviyeli çelik sac'], ['Hidrolik', 'Teleskopik silindir'], ['Arka kapak', 'Hidrolik açılır']]],
    ],
    ozellikler: ['Yarım yuvarlak gövde, tam boşalma', 'Aşınmaya dayanıklı çelik sac', 'Teleskopik hidrolik silindir', 'Hidrolik açılır arka kapak'],
  },
  {
    slug: 'kasa',
    slogan: ['YÜKÜNÜZ','GÖZDEN UZAK.'],
    meta: '13,6 m · 92 m³ · 27 t',
    kullanim: 'hassas ve değerli yük',
    etiketler: ['Çift kanat kapı','Oluklu panel','Kaymaz zemin','Logo uygulaması'],
    ad: 'Kapalı Kasa Treyler',
    ozet: 'Yükü yağmurdan, tozdan ve gözlerden koruyan sert gövde.',
    aciklama: 'Oluklu panel yapı hafif ve dayanıklıdır. Çift kanatlı arka kapı ve kilit sistemiyle hassas yükler güvenle taşınır, kurumsal renk ve logo uygulanır.',
    gruplar: [
      ['Ölçüler', [['Uzunluk', '13,6 m'], ['Genişlik', '2,55 m'], ['İç yükseklik', '2,7 m']]],
      ['Taşıma', [['Hacim', '92 m³'], ['Azami yük', '27 t'], ['Dingil', '3 adet']]],
      ['Donanım', [['Kapı', 'Çift kanat, 270°'], ['Panel', 'Oluklu alüminyum'], ['Zemin', 'Ahşap, kaymaz']]],
    ],
    ozellikler: ['Kilitli çift kanatlı arka kapı', 'Oluklu yan panel, hafif ve sağlam', 'Kurumsal renk ve logo uygulaması', 'Kaymaz ahşap zemin'],
  },
];

export const bul = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
