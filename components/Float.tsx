import { SITE } from '@/content/site';
import { makeT, type Lang } from '@/lib/i18n';

export default function Float({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  return (
    <aside className="float" aria-label={`WhatsApp, ${t('Ara')}`}>
      <a className="fl wa" href={`https://wa.me/${SITE.whatsapp}`} rel="noopener">WhatsApp</a>
      <a className="fl" href={`tel:${SITE.tel}`}>{t('Ara')}</a>
    </aside>
  );
}
