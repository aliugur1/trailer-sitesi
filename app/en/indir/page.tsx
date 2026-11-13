import DownloadsPage from '@/components/pages/DownloadsPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('en', '/indir/', 'İndirme merkezi', 'Kataloglar, teknik şartnameler, logo ve basın görselleri tek yerde.');
export default function Page() { return <DownloadsPage lang="en" />; }
