import PrivacyPage from '@/components/pages/PrivacyPage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('en', '/gizlilik/', 'Gizlilik ve KVKK', 'Kişisel verilerin korunması, aydınlatma metni ve çerez bilgisi.');
export default function Page() { return <PrivacyPage lang="en" />; }
