import GalleryPage from '@/components/pages/GalleryPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('tr', '/galeri/', 'Galeri', 'Treyler ürün aileleri ve yakın plan detay görselleri.');
export default function Page() { return <GalleryPage lang="tr" />; }
