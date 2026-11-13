// Statik çıktıyı (out/) yalnızca 127.0.0.1'de sunar: e2e testleri üretim çıktısını sınar.
import { createServer } from 'node:http';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'out');
const PORT = +(process.env.PORT ?? 5174);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.xml': 'application/xml', '.txt': 'text/plain' };

async function find(path) {
  const p = normalize(join(ROOT, decodeURIComponent(path)));
  if (!p.startsWith(ROOT)) return null; // dizin dışına çıkma
  for (const c of [p, join(p, 'index.html'), `${p}.html`]) {
    try { if ((await stat(c)).isFile()) return c; } catch { /* sıradaki aday */ }
  }
  return null;
}

// Barındırma gibi davranır (Vercel/Cloudflare): metin dosyaları brotli/gzip, hash'li dosyalar sonsuz önbellek.
// Böylece yerel Lighthouse ölçümü canlıya yakın olur.
const TEXT = new Set(['.html', '.js', '.css', '.json', '.svg', '.xml', '.txt']);
const cache = new Map();
createServer(async (req, res) => {
  const file = await find(new URL(req.url, 'http://x').pathname);
  const target = file ?? join(ROOT, '404.html');
  try {
    const ext = extname(target);
    const headers = { 'content-type': TYPES[ext] ?? 'application/octet-stream' };
    if (file && req.url.startsWith('/_next/static/')) headers['cache-control'] = 'public, max-age=31536000, immutable';
    else if (file && !['.html', '.txt', '.xml'].includes(ext)) headers['cache-control'] = 'public, max-age=3600';
    let body = await readFile(target);
    const ae = String(req.headers['accept-encoding'] ?? '');
    if (TEXT.has(ext) && /\bbr\b|\bgzip\b/.test(ae)) {
      const enc = /\bbr\b/.test(ae) ? 'br' : 'gzip';
      const key = `${target}:${enc}`;
      if (!cache.has(key)) cache.set(key, enc === 'br' ? brotliCompressSync(body) : gzipSync(body));
      body = cache.get(key);
      headers['content-encoding'] = enc;
      headers.vary = 'accept-encoding';
    }
    res.writeHead(file ? 200 : 404, headers);
    res.end(body);
  } catch { res.writeHead(404).end(); }
}).listen(PORT, '127.0.0.1', () => console.log(`http://127.0.0.1:${PORT}`));
