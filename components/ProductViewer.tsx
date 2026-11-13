'use client';
import { useEffect, useRef } from 'react';

// 3D görüntüleyici yalnızca tarayıcıda yüklenir (three.js sunucuda çalışmaz)
export default function ProductViewer({ slug, label }: { slug: string; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    let dispose: (() => void) | undefined;
    (async () => {
      // logo dokusu yazı tipi yüklenmeden çizilmesin (en fazla 1,5 sn bekle)
      await Promise.race([document.fonts.load('800 88px Archivo'), new Promise((r) => setTimeout(r, 1500))]).catch(() => {});
      const { mountViewer } = await import('@/lib/three/viewer');
      // ?still (+ az, el, dist, ty, tz, model=rig): görsel üretimi için sabit açı (scripts/render-stills.mjs)
      const q = new URLSearchParams(location.search);
      const frame: Record<string, number> = {};
      for (const k of ['az', 'el', 'dist', 'ty', 'tz']) if (q.has(k)) frame[k] = +(q.get(k) as string);
      if (alive && host.current) dispose = mountViewer(host.current, q.get('model') || slug, { still: q.has('still'), frame });
    })();
    return () => { alive = false; dispose?.(); };
  }, [slug]);
  return <div ref={host} className="viewer" role="group" aria-label={label} />;
}
