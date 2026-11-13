import RootShell from '@/components/RootShell';
import { rootMeta, viewport as vp } from '@/lib/meta';

export const metadata = rootMeta('en');
export const viewport = vp;
export default function Layout({ children }: { children: React.ReactNode }) { return <RootShell lang="en">{children}</RootShell>; }
