import SpecSheetPage from '@/components/pages/SpecSheetPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('tr', '/sartname/', 'Teknik şartname', 'Seçtiğiniz yapılandırmanın özeti. Yazdır düğmesiyle PDF olarak kaydedebilirsiniz.');
export default function Page() { return <SpecSheetPage lang="tr" />; }
