import Crumbs from '@/components/Crumbs';
import { makeT, type Lang } from '@/lib/i18n';

export default function PageHead({ title, lead, lang = 'tr', className = '', children }: { title: string; lead?: string; lang?: Lang; className?: string; children?: React.ReactNode }) {
  const t = makeT(lang);
  return (
    <header className={`page-head ${className}`.trim()}>
      <Crumbs lang={lang} items={[[title, '']]} />
      <h1>{t(title)}</h1>
      {lead && <p className="lead">{t(lead)}</p>}
      {children}
    </header>
  );
}
