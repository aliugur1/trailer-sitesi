'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Sabit teklif çubuğu: ürün başlığı ekrandan çıkınca görünür, alt bilgide çekilir
export default function PdpBar({ name, contactHref, quoteHref, contactLabel, quoteLabel }: { name: string; contactHref: string; quoteHref: string; contactLabel: string; quoteLabel: string }) {
  const [past, setPast] = useState(false);
  const [end, setEnd] = useState(false);
  useEffect(() => {
    const hero = document.querySelector('.product-hero');
    const foot = document.querySelector('footer');
    if (!hero || !foot) return;
    const a = new IntersectionObserver(([e]) => setPast(!e.isIntersecting && e.boundingClientRect.top < 0));
    const b = new IntersectionObserver(([e]) => setEnd(e.isIntersecting));
    a.observe(hero); b.observe(foot);
    return () => { a.disconnect(); b.disconnect(); };
  }, []);
  return (
    <div className={`pdp-bar${past && !end ? ' on' : ''}`}>
      <span>{name}</span>
      <Link className="btn ghost" href={contactHref}>{contactLabel}</Link>
      <Link className="btn" href={quoteHref}>{quoteLabel}</Link>
    </div>
  );
}
