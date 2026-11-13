// Sayfa metinleri (kurumsal, iletişim). Müşteri değişince bu dosya güncellenir.
export const ABOUT = {
  title: 'Yola çıkan her treyler, bir söz.',
  lead: 'Nova Treyler, taşımacılığın ihtiyacını sahadan öğrenip fabrikada çelikle cevaplayan bir üreticidir.',
  story: [
    'Yıllardır filo sahipleriyle birlikte çalışıyoruz. Hangi yükün nasıl taşındığını, hangi detayın yolda sorun çıkardığını biliyoruz. Bu bilgiyi her treylerin şasisine, kaynağına ve donanımına işliyoruz.',
    'Düz platform, tenteli, tanker, lowbed, damper ve kapalı kasa serilerini kendi tesisimizde tasarlar, keser, kaynak yapar, boyar ve test ederiz. Teslimattan sonra da servis ve yedek parça desteğiyle yanınızda kalırız.',
  ],
  values: [
    ['Dayanıklılık', 'Yüksek mukavemetli çelik ve test edilmiş yapı. Treyler yılların işini görmeli.'],
    ['Dürüstlük', 'Teklifte yazan teslimatta vardır. Beklenti ile gerçek arasında fark bırakmayız.'],
    ['Sahaya yakınlık', 'Tasarımı ofiste değil, sürücünün ve filo yöneticisinin ihtiyacından başlatırız.'],
  ] as [string, string][],
};
export const CONTACT = { lead: 'Taşıyacağınız yükü anlatın, size uygun treyleri birlikte seçelim.' };

// KVKK aydınlatma metni ŞABLONDUR: yayına almadan önce firma bilgileriyle doldurulmalı ve hukuk danışmanınca onaylanmalıdır.
// {ad}, {adres}, {eposta} site.ts'ten doldurulur.
export const PRIVACY = {
  baslik: 'Gizlilik ve KVKK',
  lead: 'Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında işlenir.',
  not: 'Bu metin şablondur. Yayına almadan önce firmanızın bilgileriyle doldurulmalı ve hukuk danışmanınızca onaylanmalıdır.',
  bolumler: [
    ['Veri sorumlusu', '{ad}, {adres} adresinde yerleşiktir. İletişim: {eposta}.'],
    ['İşlenen veriler', 'Teklif formunda paylaştığınız ad soyad, telefon, e-posta, firma adı, vergi numarası, teslimat bölgesi ve mesajınız.'],
    ['İşleme amacı', 'Teklif talebinizi değerlendirmek, size dönüş yapmak ve satış sürecini yürütmek.'],
    ['Hukuki sebep', 'Sözleşmenin kurulması için gerekli olması ve açık rızanız (KVKK m.5 ve m.6).'],
    ['Aktarım', 'Verileriniz yalnızca teklif sürecinde gerekli olan iş ortaklarımıza ve yasal yükümlülükler gereği yetkili kurumlara aktarılabilir.'],
    ['Saklama süresi', 'Teklif sürecinin gerektirdiği süre ve yasal saklama yükümlülükleri boyunca saklanır, ardından silinir veya anonim hale getirilir.'],
    ['Haklarınız', 'KVKK m.11 uyarınca verilerinize erişme, düzeltme, silme ve işlenmesine itiraz etme haklarına sahipsiniz. Başvuru için {eposta} adresine yazabilirsiniz.'],
  ] as [string, string][],
  cerezYok: 'Bu site çerez kullanmaz ve ziyaretçi ölçümü yapmaz.',
  cerezOlcum: 'Bu site çerez kullanmayan ve kişisel veri toplamayan bir ölçüm aracı kullanır.',
};
