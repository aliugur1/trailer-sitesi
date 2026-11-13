# Treyler şablonu (Next.js + TypeScript)

Genel treyler üreticisi şablon sitesi: sinematik 3D ana sayfa (gece yolu, teknik çizim, yapılandırıcı), ürün turu ve listesi, ürün detayı, galeri, katalog, servis ağı, satış sonrası, indirme merkezi, kurumsal, iletişim. Tamamen statik çıktı (backend yok), TR/EN altyapılı.

```bash
npm install
npm run dev         # http://127.0.0.1:3000
npm run build       # statik çıktı: out/  (herhangi bir statik barındırmaya yüklenir)
npm run typecheck
npm run test:e2e    # derler + 41 test (masaüstü ve mobil). Chromium yoksa: npx playwright install chromium (ya da PW_CHROMIUM=/yol/chrome)
npm run stills      # ürün/galeri/kapak görsellerini 3D sahneden yeniden üretir (önce build)
npm run catalog     # public/katalog/ altına TR ve EN PDF katalog üretir (önce build, sonra tekrar build)
npm run brand-check # yalnızca content/ değişince tüm sayfaların yeni markayla çıktığını sınar
```

## Yeni müşteriye uyarlama (kod değişmez)
| Ne | Nerede |
|---|---|
| Marka adı, telefon, e-posta, adres, saatler, ürünler ve teknik değerler | `content/site.ts` (`SITE`, `PRODUCTS`) |
| Ana sayfa, kurumsal, iletişim metinleri | `content/home.ts`, `content/pages.ts` |
| Kalite, fabrika, sertifika, servis ağı, indirme listesi, satış ekibi, şasi sorgusu | `content/b2b.ts` |
| Yapılandırıcı seçenekleri ve formüller (üretim tablosu desteği) | `content/configurator.ts` |
| Galeri | `content/gallery.ts` (+ `public/img/galeri/`) |
| Ürün turu bölümleri | `content/tour.ts` |
| İngilizce | `content/i18n/en.ts` (anahtar: Türkçe metin; Türkçe değişirse anahtar da değişir) |
| Renk ve yazı tipi | `app/globals.css` `:root`, yazı tipleri `public/fonts/` |
| Görseller | `public/img/` |
| Gerçek 3D modeller | `public/models/` + `lib/three/models.config.js` |

Marka değişince: `content/site.ts` (`ad`, `slug`, `isaret`, iletişim) ve diğer content dosyaları güncellenir, sonra `npm run stills` ve `npm run catalog` çalıştırılır (3D modeldeki yazı ve görseller markayı taşır), `public/img/logo.svg` değiştirilir.

Canlı adres için `NEXT_PUBLIC_SITE_URL` ortam değişkenini ayarlayın (canonical, sitemap ve paylaşım görselleri bunu kullanır).

## Yapı
- `app/`: sayfalar (App Router, `output: 'export'`), `sitemap.ts`. `components/`: React bileşenleri, `components/pages/` sayfa gövdeleri. `lib/`: dil (`i18n.ts`), ölçülü çizim. `lib/three/`: sahne, modeller, görüntüleyici (saf JS, yalnızca tarayıcıda yüklenir).
- Metinler sunucuda çevrilir (`makeT(lang)`), bu yüzden TR ve EN sayfalar arama motorlarına tam HTML olarak gider.
- Teklif formu `mailto:` açar; gerçek gönderim için `components/QuoteForm.tsx` içindeki `submit` değiştirilir.

Durum ve yapılacaklar: `CLAUDE.md`.
