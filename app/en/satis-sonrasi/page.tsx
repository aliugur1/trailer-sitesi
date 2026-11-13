import AfterSalesPage from '@/components/pages/AfterSalesPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('en', '/satis-sonrasi/', 'Satış sonrası', 'Yedek parça, bakım ve garanti. Treyler teslim edildikten sonra da yanınızdayız.');
export default function Page() { return <AfterSalesPage lang="en" />; }
