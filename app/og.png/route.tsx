import { ogImage } from '@/lib/brandImages';

export const dynamic = 'force-static'; // statik çıktı: out/og.png olarak üretilir
export const GET = () => ogImage();
