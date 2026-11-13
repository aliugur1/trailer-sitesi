import ProductsPage from '@/components/pages/ProductsPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('tr', '/urunler/', 'Ürünler', 'Altı treyler ailesini sinematik 3D turla gezin, teknik değerlere göre süzün ve karşılaştırın.');
export default function Page() { return <ProductsPage lang="tr" />; }
