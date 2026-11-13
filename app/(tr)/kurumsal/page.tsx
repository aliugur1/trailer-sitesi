import AboutPage from '@/components/pages/AboutPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('tr', '/kurumsal/', 'Kurumsal', 'Fabrika, Ar-Ge, kalite ve sertifikalar. Taşımacılığın ihtiyacını sahadan öğrenip fabrikada çelikle cevaplıyoruz.');
export default function Page() { return <AboutPage lang="tr" />; }
