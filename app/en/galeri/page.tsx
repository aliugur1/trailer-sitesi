import GalleryPage from '@/components/pages/GalleryPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('en', '/galeri/', 'Galeri', 'Treyler ürün aileleri ve yakın plan detay görselleri.');
export default function Page() { return <GalleryPage lang="en" />; }
