import { GEOMETRY, axlePositions, kingpinZ } from '../content/configurator';
import { makeT, makeNum, type Lang } from './i18n';

// Ölçekli yan görünüş şeması (SVG). Ölçüler configurator.config.js geometrisinden gelir.
// d: { L, axles, H, sekil: 'platform' | 'kutu' | 'tank' | 'lowbed' | 'damper' }
export interface DrawingSpec { L: number; axles: number; H: number; sekil: 'platform' | 'kutu' | 'tank' | 'lowbed' | 'damper' }
export function sideDrawing({ L, axles, H, sekil }: DrawingSpec, lang: Lang = 'tr'): string {
  const t = makeT(lang), num = makeNum(lang);
  const S = 60, padX = 70, top = 40, W = L * S + padX * 2, base = top + H * S, Ht = base + 150;
  const x = (z: number) => padX + (L / 2 - z) * S; // ön solda
  const y = (m: number) => base - m * S;
  const az = axlePositions(L, axles), kp = kingpinZ(L), deck = sekil === 'lowbed' ? 0.95 : GEOMETRY.deckHeight;
  const r = 0.5 * S, f = (n: number) => n.toFixed(1);
  const line = (x1: number, y1: number, x2: number, y2: number, c = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"${c ? ` class="${c}"` : ''}/>`;
  const rect = (x1: number, y1: number, w: number, h: number, rx = 0) => `<rect x="${f(x1)}" y="${f(y1)}" width="${f(w)}" height="${f(h)}" rx="${rx}"/>`;
  const xf = x(L / 2), xr = x(-L / 2);
  let body = '';
  if (sekil === 'lowbed') {
    const xn = x(L / 2 - 3.4);
    body = `<path d="M${f(xf)} ${f(y(1.5))} H${f(xn - 20)} L${f(xn + 30)} ${f(y(deck))} H${f(xr)} V${f(y(deck - 0.3))} H${f(xn + 20)} L${f(xn - 30)} ${f(y(1.2))} H${f(xf)} Z"/>`;
  } else {
    body = rect(xf, y(deck), L * S, 0.22 * S);
    if (sekil === 'platform') body += rect(xf, y(H), 0.12 * S, (H - deck) * S) + rect(xf, y(deck + 0.6), L * S, 0.6 * S);
    if (sekil === 'kutu') body += rect(xf, y(H), L * S, (H - deck) * S, 4);
    if (sekil === 'tank') body += rect(xf + 0.3 * S, y(H - 0.4), (L - 0.6) * S, (H - 0.4 - deck) * S, (H - 0.4 - deck) * S * 0.48);
    if (sekil === 'damper') body += `<path d="M${f(xf)} ${f(y(H))} H${f(xr + 30)} L${f(xr)} ${f(y(deck + 0.3))} H${f(xf)} Z"/>`;
  }
  const wheels = az.map((z) => `<circle cx="${f(x(z))}" cy="${f(base - r)}" r="${f(r)}"/><circle cx="${f(x(z))}" cy="${f(base - r)}" r="${f(r * 0.55)}"/>`).join('');
  const lz = sekil === 'lowbed' ? L / 2 - 3.6 : L / 2 - GEOMETRY.landingFromFront;
  const landing = rect(x(lz) - 5, y(deck - 0.1), 10, (deck - 0.1) * S - 4) + line(x(lz) - 14, base - 3, x(lz) + 14, base - 3);
  // ölçüler
  const dim = (x1: number, x2: number, yy: number, label: string, cls = '') => line(x1, yy, x2, yy, 'd') + line(x1, yy - 6, x1, yy + 6, 'd') + line(x2, yy - 6, x2, yy + 6, 'd') + `<text x="${f((x1 + x2) / 2)}" y="${f(yy - 7)}"${cls ? ` class="${cls}"` : ''}>${label}</text>`;
  const st = [L / 2, kp, ...[...az].reverse(), -L / 2];
  let chain = '';
  for (let i = 1; i < st.length; i++) chain += dim(x(st[i - 1]), x(st[i]), base + 46, num(st[i - 1] - st[i], 2), 's');
  const hx = xr + 36;
  const height = line(hx, base, hx, y(H), 'd') + line(hx - 6, base, hx + 6, base, 'd') + line(hx - 6, y(H), hx + 6, y(H), 'd') + `<text x="${f(hx + 12)}" y="${f((base + y(H)) / 2)}" transform="rotate(-90 ${f(hx + 12)} ${f((base + y(H)) / 2)})">${num(H, 2)} m</text>`;
  return `<svg class="drawing" viewBox="0 0 ${f(W)} ${f(Ht)}" role="img" aria-label="${t('Ölçülü yan görünüş')}">
    ${line(20, base, W - 20, base, 'g')}
    <g class="b">${body}${landing}${wheels}<circle cx="${f(x(kp))}" cy="${f(y(deck - 0.25))}" r="5"/></g>
    ${chain}${dim(xf, xr, base + 96, `${t('UZUNLUK')} ${num(L, 2)} m`)}${height}
    <text x="${f(x(kp))}" y="${f(base + 20)}" class="s">KINGPIN</text>
    ${[...az].reverse().map((z, i) => `<text x="${f(x(z))}" y="${f(base + 20)}" class="s">A${i + 1}</text>`).join('')}
  </svg>`;
}
