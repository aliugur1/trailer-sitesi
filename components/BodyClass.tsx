'use client';
import { useEffect } from 'react';

// Sayfa türüne göre <body> sınıfı. Stil HTML'deki işarete (data-bc) bağlıdır: sunucu çıktısında baştan geçerli olur,
// hidrasyondan sonra düzen kaymaz. Sınıf ayrıca JS ile de eklenir (geri kalan kod body sınıfını okuyabilsin).
export default function BodyClass({ name }: { name: string }) {
  useEffect(() => {
    document.body.classList.add(...name.split(' '));
    return () => document.body.classList.remove(...name.split(' '));
  }, [name]);
  return <span hidden data-bc={name} />;
}
