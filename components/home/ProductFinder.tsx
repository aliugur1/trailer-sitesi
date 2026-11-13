'use client';
import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { LOADS } from '@/content/b2b';
import { PRODUCTS } from '@/content/site';
import { makeT, type Lang } from '@/lib/i18n';

// "Ne taşıyorsunuz?": yük türü seçilince uygun ürünler kalır, ikinci tıklama seçimi kaldırır
export default function ProductFinder({ lang = 'tr' }: { lang?: Lang }) {
  const t = makeT(lang);
  const [sel, setSel] = useState<string | null>(null);
  const slugs = sel ? LOADS.find((l) => l.id === sel)?.slugs ?? null : null;
  return (
    <>
      <section className="band tight finder" id="bulucu">
        <p className="kicker reveal">{t('Bulucu')}</p>
        <h2 className="reveal">{t('Ne taşıyorsunuz?')}</h2>
        <p className="lead reveal">{t('Yükünüzü seçin, uygun treylerleri gösterelim.')}</p>
        <div className="chips gal-filter reveal" role="group" aria-label={t('Yük türü')}>
          {LOADS.map((l) => <button key={l.id} type="button" aria-pressed={sel === l.id} onClick={() => setSel(sel === l.id ? null : l.id)}>{t(l.label)}</button>)}
        </div>
      </section>
      <section className="band" id="urunler">
        <p className="kicker reveal">{t('Ürün aileleri')}</p>
        <h2 className="reveal">{t('Altı ürün ailesi.')}</h2>
        <p className="lead reveal">{t('Her birini 3D olarak gezebilir, ayrıntı sayfasında teknik tabloya bakabilirsiniz.')}</p>
        <div className={`bento reveal${slugs ? ' filtered' : ''}`}>
          {PRODUCTS.map((p) => <ProductCard key={p.slug} p={p} lang={lang} hidden={!!slugs && !slugs.includes(p.slug)} />)}
        </div>
      </section>
    </>
  );
}
