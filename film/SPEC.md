GOAL:    İzleyici 30 saniyede şunu anlar: ölçüyü seçersin, treyler kurulur, seçimin tek tıkla teklife döner. Son karede "Teklif Al".
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps. SESSİZ (müzik ve ses yok, kullanıcı istedi).
TIME:    30 s x 30 = 900 kare. Ham görüntü: gerçek sitenin kare kare çekimi (scripts/film-capture.mjs) 0-21 s; gerçek teklif formu 21-25.2 s; kapanış kartı 25.2-30 s.

LOOK:    Zemin: sitenin kendi gündüz sanayi görüntüsü (çelik gri #bac6d1, asfalt, lacivert çizim perdesi). Mürekkep grafit #13161b, tek vurgu sinyal sarısı #ffc400.
         Vurgu yalnızca: başlık bloklarındaki tek vurgulu sözcük ve kapanışta zemin. Başlık yazı tipi Archivo Black 118 px, iz -1%, satır 1.0; kapanış wordmark 210 px.
         Etiket/telefon: JetBrains Mono 52 px. Metin en az 52 px (1080p'de okunur), her başlık en az 1.2 s ekranda.
         Ortam: ürünün kendisi (gerçek site ekranı); özel çizim yok. Başlıklar grafit düz blok (#13161b, gölge yok), sol kenara yapışık.
         Işık/derinlik: gölge yok, grain yok, vinyet yok. Görüntü olduğu gibi.
OBJECTS: Gerçek site: üç perdeli sahne, ölçü katmanı (SVG), yapılandırıcı paneli, gerçek tıklamalar, gerçek teklif formu (mesaj alanında "Yapılandırma: 12,0 m, 4 dingil, ..." yazıyor).
         Sahte imleç 64 px (kare genişliğinin %3,3) yapılandırıcıda gerçek tıklamaları yapar.
MOTION:  Giriş: clip-path soldan açılır 0.28 s, ease power3.out. Çıkış: clip-path sağdan kapanır 0.2 s, ease power2.in.
         Kamera: yapılandırma sırasında ham görüntüye 1.00 -> 1.08 yavaş itme (11 s, ease none), nokta: (1280, 260); üst menü kesilmez. Teklif formunda mesaj alanına itme 1.0 -> 2.1, 1.6 s, power3.inOut.
         Geçişler (3 tür): sarı blok silme (görüntü -> form), itme (form -> mesaj), kapanış kartı yukarı bindirme.
         Kapanış: rozet 0.6 s back.out(1.6) ile yerine oturur, wordmark 0.4 s sonra soldan açılır, telefon ve buton 0.2 s arayla yukarı gelir.
SHOTS:   0.0-9.2 s    Gerçek ilk ekran + çekici ayrılır + çizim perdesi. Vurgu başlık: 0.5-3.4 s "ÖNCE ÖLÇÜ." (üst sol). Elde edilen: çekici gider, ölçüler çizilir.
         9.2-21.0 s   Yapılandırıcı. Başlıklar tıklamayla aynı karede: 10.0 "TİP." / 11.6 "UZUNLUK." / 15.0 "DİNGİL." / 17.2 "RENK." / 18.6 "YANDAN." / 19.8 "ÖZET.".
         21.0-25.2 s  Gerçek teklif formu, mesaj alanına itme. Başlık: "SEÇİM TEKLİFE TAŞINIR." (alt sol).
         25.2-30.0 s  Kapanış: sarı zemin, grafit rozet + wordmark, telefon, "Teklif Al" düğmesi (son 1.8 s tutulur).
BANNED:  Koyu void üzerinde küçük öğeler; parıltı/neon; cam kart; her şey ortada; hepsi birden solma; köşe etiketi; logo köşede; ekran görüntüsü üstüne soluk başlık;
         (ilk render sonrası eklenir).
QA:      0.4 s (ilk ekran başlık), 6.0 s (çizim perdesi + ölçüler), 10.5 s (Tanker seçili, "TİP."), 13.0 s (slider 12,0 m), 17.8 s (sarı renk), 22.8 s (mesaj itme), 26.5 s (kapanış kartı), 29.5 s (son tutuş).
