import { ImageResponse } from 'next/og';
import { SITE } from '@/content/site';

// Marka görselleri content/site.ts'ten üretilir: marka değişince kendiliğinden yenilenir (görsel dosyası tutulmaz)
export const iconImage = () => new ImageResponse(
  <div style={{ width: '100%', height: '100%', background: '#ffc400', color: '#13161b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800, borderRadius: 10 }}>{SITE.isaret}</div>,
  { width: 64, height: 64 },
);

export const ogImage = () => {
  const [first, ...rest] = SITE.ad.toUpperCase().split(' ');
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', background: '#ffc400', color: '#13161b', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 90px', fontWeight: 800, lineHeight: 0.95 }}>
      <div style={{ fontSize: 190, display: 'flex' }}>{first}</div>
      <div style={{ fontSize: 190, display: 'flex' }}>{rest.join(' ')}</div>
      <div style={{ marginTop: 40, width: 220, height: 14, background: '#13161b' }} />
    </div>,
    { width: 1200, height: 630 },
  );
};
