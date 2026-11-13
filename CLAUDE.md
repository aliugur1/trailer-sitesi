# Treyler şablonu (Next.js + TypeScript)
Genel treyler üreticisi şablonu. Yeni müşteride kod değişmez: yalnızca `content/` (yazılar, ürünler, veriler), `public/` (görsel, model) ve marka renkleri (`app/globals.css` `:root`) değişir. Bu vaat `npm run brand-check` ile sınanır.
Komutlar: `npm run dev` (127.0.0.1:3000), `npm run build` (statik çıktı `out/`), `npm run typecheck`, `npm run test:e2e` (derler ve 53 testi koşar (axe erişilebilirlik dahil); var olan Chromium için `PW_CHROMIUM=/yol/chrome`, yoksa `npx playwright install chromium`), `npm run stills` (3D sahneden görseller), `npm run catalog` (PDF katalog, sonra tekrar build), `npm run brand-check`.
Notlar: iç sayfa stili `body:has([data-bc~="inner"])` (BodyClass bileşeninin HTML işareti, hidrasyon kayması olmasın), kaydırma girişi `.reveal` JS'siz (`animation-timeline: view()`), `scripts/serve-out.mjs` brotli ve önbellek başlığıyla canlıya yakın ölçüm sağlar.
Kurallar: "treyler" (dorse değil), tek CTA etiketi "Teklif Al", metinde em-dash yok, kaynak dil Türkçe, çeviri sözlüğü `content/i18n/en.ts` (anahtar Türkçe metin; metin değişince anahtar da güncellenir; eksik çeviriyi e2e testi yakalar), müşteri verisi (adres vb.) `translate="no"`.

## Yapı
- `content/`: tüm içerik (site.ts marka/ürünler, home.ts, pages.ts, b2b.ts, configurator.ts, gallery.ts, tour.ts, i18n/).
- `app/(tr)/` kökte Türkçe, `app/en/` İngilizce; iki ayrı kök yerleşim (`components/RootShell.tsx`, `<html lang>` sunucuda). Sayfa dosyaları ince: `components/pages/*Page.tsx` (lang parametreli) + `lib/meta.ts` metadata. `app/sitemap.ts` TR+EN hreflang.
- `components/`: React bileşenleri. `lib/`: `i18n.ts` (sunucuda çeviri), `drawing.ts` (ölçülü çizim), `lib/three/` (sahne, modeller, görüntüleyici; saf JS, yalnızca tarayıcıda yüklenir).
- `scripts/`: `serve-out.mjs` (out/ yerel sunucu), `render-stills.mjs`, `build-catalog.mjs`, `brand-swap-check.mjs`, `film-capture.mjs` (tanıtım filmi için gerçek siteyi kare kare çeker; sitede `?film` modu).
- `film/`: HyperFrames projesi (30 sn sessiz tanıtım filmi: SPEC.md, index.html, compositions/). Render: `cd film && npx hyperframes render`; web için küçültülmüş hali `public/video/` (ana sayfada `content/home.ts` VIDEO).

## İlerleme
- [x] Vite -> Next.js 16 + TypeScript (strict), statik export, yerel yazı tipleri
- [x] Tüm sayfalar: ana sayfa (üç perde + adımlı yapılandırıcı), ürünler (tur, filtre, karşılaştırma), ürün detay, kurumsal, galeri, katalog, servis ağı, satış sonrası, indir, şartname, iletişim/teklif
- [x] İngilizce `/en/...` (ayrı html lang, canonical, hreflang, sitemap)
- [x] SEO: sunucu HTML'inde başlık, açıklama, canonical, og:image, h1, içerik
- [x] e2e: 41 test (masaüstü + mobil): sahne, yapılandırıcı, teklif ön doldurma, filtreler, TR+EN tüm sayfalar (konsol, kırık istek, taşma, eksik çeviri), SEO, kırık bağlantı, katalog PDF, GLB override, 404
- [x] Betikler yeni yapıya taşındı (stills, katalog PDF); `brand-check`: yalnızca content/ değişince eski marka izi kalmıyor
- [x] Gündüz sanayi teması, güven şeridi, referanslar, yetkili mesajı (content/home.ts); 30 sn sessiz tanıtım filmi ana sayfada (43 test)
- [ ] Marka değişince filmi yeniden üret: `npm run build`, `node scripts/film-capture.mjs`, `film/` içinde render, `public/video/` güncelle (video içindeki marka yazısı görüntüden gelir)
- [ ] Müşterinin gerçek GLB modelleri ve fotoğrafları (`lib/three/models.config.js`, `content/gallery.ts`)
- [ ] Marka değişince `npm run stills` (modeldeki yazı, kapak, ürün görselleri) ve `public/img/logo.svg` yenilenir
- [ ] Gerçek veri bağlantıları: şasi no sorgusu (`content/b2b.ts` lookupVin), bayi listesi/harita, sertifika dosyaları
- [ ] Teklif formu için gerçek gönderim servisi (şu an mailto, `components/QuoteForm.tsx`)
- [x] Lighthouse (mobil, canlıya yakın): erişilebilirlik/en iyi uygulamalar/SEO 100; 3D olmayan sayfalar perf 90-99, 3D sayfalar yazılım WebGL'de düşük (TBT); robots, JSON-LD, KVKK sayfası, form uç noktası, favicon/og görseli
- [x] Vercel geçici önizleme denendi (`vercel deploy --temporary`, 60 dk, kalıcı değil); kalıcı için `vercel login` + `vercel` (preview), üretim ayrıca onay
- [ ] Gerçek cihazda kare hızı ölçümü (yalnızca yazılım çizicide denendi) ve 3D yükünün düşük seviye telefonda sınanması
- [ ] Canlıya alırken: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_FORM_ENDPOINT`, istenirse `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` ortam değişkenleri; KVKK metni hukuk onayı
