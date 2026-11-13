import BodyClass from '@/components/BodyClass';
import PageHead from '@/components/PageHead';
import { PRIVACY } from '@/content/pages';
import { SITE } from '@/content/site';
import { makeT, type Lang } from '@/lib/i18n';

export default function PrivacyPage({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const VALUES: Record<string, string> = { '{ad}': SITE.ad, '{adres}': SITE.adres, '{eposta}': SITE.eposta };
  // yer tutucular müşteri verisidir: çevrilmez (translate="no"), cümle çevirisi sözlükten gelir
  const fill = (s: string) => t(s).split(/(\{ad\}|\{adres\}|\{eposta\})/g).map((part, i) => (part in VALUES ? <span key={i} translate="no">{VALUES[part]}</span> : part));
  return (
    <main>
      <BodyClass name="inner" />
      <PageHead lang={lang} title={PRIVACY.baslik} lead={PRIVACY.lead} />
      <section className="band tight story">
        <div>
          {PRIVACY.bolumler.map(([b, d]) => <div key={b} className="reveal"><h2>{t(b)}</h2><p>{fill(d)}</p></div>)}
          <div className="reveal"><h2>{t('Çerezler ve ölçüm')}</h2><p>{t(SITE.analitik.plausible ? PRIVACY.cerezOlcum : PRIVACY.cerezYok)}</p></div>
          <p className="small">{t(PRIVACY.not)}</p>
        </div>
      </section>
    </main>
  );
}
