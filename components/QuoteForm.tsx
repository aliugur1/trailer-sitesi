'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { PRODUCTS, SITE } from '@/content/site';
import { href, makeT, type Lang } from '@/lib/i18n';

// Gönderim: SITE.form.endpoint doluysa JSON POST (başarı/hata durumları gösterilir), boşsa e-posta uygulaması hazır metinle açılır (mailto).
export default function QuoteForm({ lang = 'tr', preset = '' }: { lang?: Lang; preset?: string }) {
  const t = makeT(lang);
  const form = useRef<HTMLFormElement>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [tip, setTip] = useState(preset || PRODUCTS[0].slug);
  const [msg, setMsg] = useState('');

  // Ürün sayfası (?tip=) ve yapılandırıcı (?uzunluk=&dingil=...) seçimleri forma taşınır
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const slug = q.get('tip');
    if (slug && PRODUCTS.some((p) => p.slug === slug)) setTip(slug);
    if (q.get('uzunluk') && q.get('dingil')) {
      const extra = [['renk', 'renk'], ['marka', 'dingil markası'], ['fren', 'fren'], ['ops', 'opsiyonlar']].filter(([k]) => q.get(k)).map(([k, l]) => `, ${t(l)}: ${q.get(k)}`).join('');
      setMsg(`${t('Yapılandırma')}: ${q.get('uzunluk')} m, ${q.get('dingil')} ${t('dingil')}${extra}.\n`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const f = form.current!;
    const d = Object.fromEntries(new FormData(f)) as Record<string, string>;
    const e1: Record<string, string> = {};
    if (!d.ad.trim()) e1.ad = t('Adınızı yazın.');
    if (!(d.telefon.trim() || d.eposta.trim())) e1.telefon = t('Telefon veya e-posta yazın.');
    if (d.eposta.trim() && !(f.elements.namedItem('eposta') as HTMLInputElement).validity.valid) e1.eposta = t('E-posta adresi geçersiz.');
    if (!d.kvkk) e1.kvkk = t('Devam etmek için aydınlatma metnini onaylayın.');
    setErrs(e1);
    if (Object.keys(e1).length) return;
    if (d.website) { setSent(true); return; } // bal küpü alanı dolu: bot, sessizce başarılı göster
    const tipAd = PRODUCTS.find((p) => p.slug === d.tip) ? t(PRODUCTS.find((p) => p.slug === d.tip)!.ad) : t('Özel üretim');
    const rows: [string, string][] = [[t('Ad soyad'), d.ad], [t('Firma adı'), d.firma], [t('Vergi no'), d.vergi], [t('Telefon'), d.telefon], [t('E-posta'), d.eposta], [t('Treyler tipi'), tipAd], [t('İstenen adet'), d.adet], [t('Teslimat bölgesi'), d.bolge], [t('Finansman tercihi'), t(d.finansman)]];
    const body = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${d.mesaj}`;
    const subject = `${t('Teklif talebi')}: ${tipAd}`;
    if (!SITE.form.endpoint) {
      location.href = `mailto:${SITE.eposta}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setSent(true);
      return;
    }
    setState('sending');
    try {
      const res = await fetch(SITE.form.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ konu: subject, tip: d.tip, ad: d.ad, firma: d.firma, vergi: d.vergi, telefon: d.telefon, eposta: d.eposta, adet: d.adet, bolge: d.bolge, finansman: d.finansman, mesaj: d.mesaj, dil: lang, metin: body }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
      setState('idle');
      f.reset();
    } catch {
      setState('error'); // alanlar korunur, kullanıcı yeniden deneyebilir
    }
  };

  const field = (id: string, name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, withErr = false) => (
    <div className="field">
      <label htmlFor={id}>{t(label)}</label>
      <input id={id} name={name} aria-invalid={withErr ? !!errs[name] : undefined} {...props} />
      {withErr && <p className="err" role="alert">{errs[name]}</p>}
    </div>
  );
  return (
    <form className="qform" ref={form} noValidate onSubmit={submit}>
      {field('q-ad', 'ad', 'Ad soyad', { autoComplete: 'name', required: true }, true)}
      <div className="row">
        {field('q-tel', 'telefon', 'Telefon', { type: 'tel', autoComplete: 'tel' }, true)}
        {field('q-mail', 'eposta', 'E-posta', { type: 'email', autoComplete: 'email' }, true)}
      </div>
      <div className="row">
        {field('q-firma', 'firma', 'Firma adı', { autoComplete: 'organization' })}
        {field('q-vergi', 'vergi', 'Vergi no', { inputMode: 'numeric' })}
      </div>
      <div className="row">
        {field('q-adet', 'adet', 'İstenen adet', { type: 'number', min: 1, defaultValue: 1 })}
        {field('q-bolge', 'bolge', 'Teslimat bölgesi', { placeholder: t('Şehir ya da ülke') })}
      </div>
      <div className="row">
        <div className="field"><label htmlFor="q-fin">{t('Finansman tercihi')}</label>
          <select id="q-fin" name="finansman">{['Peşin', 'Kredi', 'Leasing'].map((o) => <option key={o} value={o}>{t(o)}</option>)}</select></div>
        <div className="field"><label htmlFor="q-tip">{t('Treyler tipi')}</label>
          <select id="q-tip" name="tip" value={tip} onChange={(e) => setTip(e.target.value)}>
            {PRODUCTS.map((p) => <option key={p.slug} value={p.slug}>{t(p.ad)}</option>)}
            <option value="ozel">{t('Özel üretim')}</option>
          </select></div>
      </div>
      <div className="field"><label htmlFor="q-msg">{t('Mesajınız')}</label>
        <textarea id="q-msg" name="mesaj" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t('Taşıyacağınız yük, adet ve teslim süresi')} /></div>
      <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="field consent">
        <label><input type="checkbox" name="kvkk" aria-invalid={!!errs.kvkk} />
          <span>{t('Teklif talebim için kişisel verilerimin işlenmesine ilişkin {link} okudum.').split('{link}').flatMap((part, i, arr) => (i < arr.length - 1 ? [part, <Link key={i} href={href(lang, '/gizlilik/')} target="_blank">{t('aydınlatma metnini')}</Link>] : [part]))}</span></label>
        <p className="err" role="alert">{errs.kvkk}</p>
      </div>
      <button className="btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? t('Gönderiliyor...') : t('Teklif Al')}</button>
      {state === 'error' && <p className="err" role="alert">{t('Gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin ya da bize telefonla ulaşın.')}</p>}
      <p className="ok" role="status" hidden={!sent}>{SITE.form.endpoint ? t('Talebiniz alındı. En kısa sürede size dönüş yapacağız.') : t('E-posta uygulamanız hazır metinle açıldı. Göndermeyi unutmayın. Açılmazsa {eposta} adresine yazabilirsiniz.').replace('{eposta}', SITE.eposta)}</p>
    </form>
  );
}
