import { FACTORY_PHOTOS, OWNER, REFERENCES, TRUST, VIDEO } from '@/content/home';
import { makeT, type Lang } from '@/lib/i18n';

// Güven şeridi: ilk ekranın hemen altında sertifika, garanti ve yol yardım
export function TrustBar({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  if (!TRUST.length) return null;
  return (
    <section className="trust" aria-label={t('Güven')}>
      <ul>{TRUST.map(([v, l]) => <li key={v}><strong>{t(v)}</strong><span>{t(l)}</span></li>)}</ul>
    </section>
  );
}

// Referanslar + yetkili mesajı + (varsa) fabrika fotoğrafları
export function Proof({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const initials = OWNER.ad.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return (
    <>
      {FACTORY_PHOTOS.length > 0 && (
        <section className="band tight">
          <p className="kicker reveal">{t('Fabrika')}</p>
          <h2 className="reveal">{t('Üretimin içinden.')}</h2>
          <div className="gal-strip reveal">{FACTORY_PHOTOS.map((f) => <img key={f.src} src={f.src} alt={t(f.baslik)} loading="lazy" />)}</div>
        </section>
      )}
      {REFERENCES.length > 0 && (
        <section className="band tight refs">
          <p className="kicker reveal">{t('Referanslar')}</p>
          <h2 className="reveal">{t('Filolar bize güveniyor.')}</h2>
          <ul className="ref-grid reveal">{REFERENCES.map((r) => <li key={r}>{t(r)}</li>)}</ul>
          <p className="small">{t('Firma adları şablon örneğidir.')}</p>
        </section>
      )}
      <section className="band tight owner">
        <figure className="reveal">
          <div className="avatar" aria-hidden="true">{OWNER.foto ? <img src={`/img/${OWNER.foto}`} alt="" /> : initials}</div>
          <blockquote>“{t(OWNER.mesaj)}”</blockquote>
          <figcaption><b>{OWNER.ad}</b><span>{t(OWNER.unvan)}</span></figcaption>
        </figure>
      </section>
    </>
  );
}

// Tanıtım filmi: yerel dosya, ses yok, kendiliğinden oynamaz; yüklenme oynat denince başlar (preload none)
export function FilmSection({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  if (!VIDEO.src) return null;
  return (
    <section className="band tight film" id="film">
      <p className="kicker reveal">{t('Film')}</p>
      <h2 className="reveal">{t(VIDEO.baslik)}</h2>
      <p className="lead reveal">{t(VIDEO.aciklama)}</p>
      <div className="film-frame reveal">
        <video controls playsInline preload="none" poster={VIDEO.poster} aria-label={t(VIDEO.baslik)}>
          <source src={VIDEO.src} type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
