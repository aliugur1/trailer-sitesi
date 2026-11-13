'use client';
import Link from 'next/link';
import { useState } from 'react';
import { EXTRA, SAMPLE_VINS, lookupVin } from '@/content/b2b';
import { bul } from '@/content/site';
import { href, makeT, type Lang } from '@/lib/i18n';

type Result = Awaited<ReturnType<typeof lookupVin>>;

// Şasi numarası sorgusu (örnek veri; gerçek sistemde lookupVin üreticinin servisine bağlanır)
export default function VinLookup({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const [vin, setVin] = useState('');
  const [err, setErr] = useState('');
  const [res, setRes] = useState<{ vin: string; r: Result } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = vin.trim().toUpperCase();
    const valid = /^[A-HJ-NPR-Z0-9]{17}$/.test(v);
    setErr(valid ? '' : t('Şasi numarası 17 haneli olmalı (I, O, Q harfleri kullanılmaz).'));
    if (!valid) { setRes(null); return; }
    setRes({ vin: v, r: await lookupVin(v) });
  };

  const r = res?.r;
  const p = r ? bul(r.slug) : null;
  return (
    <>
      <div>
        <h2>{t('Şasi numarasıyla sorgula')}</h2>
        <p className="lead">{t('Şasi numaranızı yazın, aracınıza uygun yedek parça listesi ve garanti durumu gelsin.')}</p>
        <form className="qform" noValidate onSubmit={submit}>
          <div className="field"><label htmlFor="vin">{t('Şasi numarası (17 hane)')}</label>
            <input id="vin" name="vin" maxLength={17} autoComplete="off" spellCheck={false} value={vin} aria-invalid={!!err} onChange={(e) => setVin(e.target.value)} />
            <p className="err" role="alert">{err}</p></div>
          <button className="btn" type="submit">{t('Sorgula')}</button>
          <p className="small">{t('Örnek veridir. Denemek için:')} <button type="button" className="linkish" onClick={() => setVin(SAMPLE_VINS[0])}>{SAMPLE_VINS[0]}</button></p>
        </form>
      </div>
      <div aria-live="polite">
        {res && !r && <div className="spec-group"><h3>{t('Kayıt bulunamadı')}</h3><p className="lead">{t('Bu şasi numarası örnek veride yok. Servis ekibimiz telefonla yardımcı olur.')}</p></div>}
        {res && r && p && (
          <div className="spec-group vin-card" data-vin={res.vin}>
            <h3>{t(p.ad)}</h3>
            <dl>
              <div><dt>{t('Model')}</dt><dd>{EXTRA[r.slug as keyof typeof EXTRA].kod}</dd></div>
              <div><dt>{t('Üretim yılı')}</dt><dd>{r.yil}</dd></div>
              <div><dt>{t('Garanti')}</dt><dd>{t(new Date(r.garanti) > new Date() ? 'Devam ediyor' : 'Sona erdi')}</dd></div>
            </dl>
            <table className="parts"><thead><tr><th>{t('Yedek parça')}</th><th>{t('Parça no')}</th></tr></thead>
              <tbody>{r.parcalar.map(([a, n]) => <tr key={n + a}><td>{t(a)}</td><td>{n}</td></tr>)}</tbody></table>
            <Link className="btn" href={`${href(lang, '/iletisim/')}?tip=${r.slug}#teklif`}>{t('Parça talebi gönder')}</Link>
          </div>
        )}
      </div>
    </>
  );
}
