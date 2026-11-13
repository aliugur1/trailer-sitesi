import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductPage from '@/components/pages/ProductPage';
import { PRODUCTS, bul } from '@/content/site';
import { pageMeta } from '@/lib/meta';

export const dynamicParams = false;
export const generateStaticParams = () => PRODUCTS.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = bul((await params).slug);
  return p ? pageMeta('tr', `/urun/${p.slug}/`, p.ad, p.ozet, { image: `/img/${p.slug}.png` }) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!bul(slug)) notFound();
  return <ProductPage slug={slug} lang="tr" />;
}
