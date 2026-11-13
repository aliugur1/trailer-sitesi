import ContactPage from '@/components/pages/ContactPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('en', '/iletisim/', 'İletişim ve Teklif', 'Taşıyacağınız yükü anlatın, size uygun treyleri birlikte seçelim.');
export default function Page() { return <ContactPage lang="en" />; }
