import HomePage from '@/components/pages/HomePage';
import { pageMeta } from '@/lib/meta';

export const metadata = pageMeta('en', '/', 'Düz Platform, Tenteli, Tanker, Lowbed, Damper Treyler', 'Düz platform, tenteli, tanker, lowbed, damper ve kapalı kasa treyler üretimi. Ürünleri 3D gezin, teklif alın.', { absolute: true, image: '/img/hero.jpg' });
export default function Page() { return <HomePage lang="en" />; }
