import NetworkPage from '@/components/pages/NetworkPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('tr', '/servis-agi/', 'Servis ağı', 'Yetkili servisler ve satış noktaları. Liste ve harita şablon örneğidir.');
export default function Page() { return <NetworkPage lang="tr" />; }
