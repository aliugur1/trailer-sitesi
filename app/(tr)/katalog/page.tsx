import CatalogPage from '@/components/pages/CatalogPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('tr', '/katalog/', 'Katalog', 'Altı ürün ailesi, teknik değerler ve iletişim bilgileri. PDF olarak indirin.');
export default function Page() { return <CatalogPage lang="tr" />; }
