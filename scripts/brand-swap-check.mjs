// Şablon vaadi: yeni müşteride yalnızca content/ değişir. Bu betik projeyi geçici klasöre kopyalar, content/ içinde markayı
// değiştirir, derler ve çıktıda eski markadan iz kalmadığını doğrular (kodda gömülü marka sızıntısını yakalar).
// Kullanım: npm run brand-check
import { execSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SRC = process.cwd();
// Kopya proje içinde durur (Turbopack çalışma kökü dışındaki node_modules'u derlemez); kendi lockfile'ı olmadığı için kök yukarıdaki projedir
const TMP = join(SRC, '.brand-swap-tmp');
await rm(TMP, { recursive: true, force: true });
await mkdir(TMP);
const SKIP = new Set(['node_modules', '.next', 'out', '_eski-vite', 'test-results', '.git', '.omc', '.playwright-mcp', '.brand-swap-tmp', 'package-lock.json', 'tests', 'scripts']);
for (const e of await readdir(SRC)) if (!SKIP.has(e)) await cp(join(SRC, e), join(TMP, e), { recursive: true });

// 1) yalnızca content/ içinde marka değişimi
const REPL = [[/Nova/g, 'Atlas'], [/nova-treyler/g, 'atlas-treyler'], [/'nt\.'/g, "'at.'"], [/info@ornek\.com/g, 'hello@atlas.example'], [/0 000 000 00 /g, '0 111 111 11 ']];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (p.endsWith('.ts')) await writeFile(p, REPL.reduce((s, [a, b]) => s.replace(a, b), await readFile(p, 'utf8')));
  }
}
await walk(join(TMP, 'content'));

// 2) derle
try { execSync('npx next build', { cwd: TMP, stdio: 'pipe' }); } catch (e) { console.error(String(e.stdout) + String(e.stderr)); process.exit(1); }

// 3) eski marka izi aranır (yalnızca üretilen HTML; görseller npm run stills ile yenilenir)
const FORBIDDEN = [/\bnova\b/i, /nova-treyler/, />nt\.</, /info@ornek\.com/, /0 000 000 00 /];
const bad = [];
async function scan(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!['_next', 'img', 'fonts', 'models', 'katalog'].includes(e.name)) await scan(p); continue; }
    if (!p.endsWith('.html')) continue;
    const html = await readFile(p, 'utf8');
    for (const re of FORBIDDEN) if (re.test(html)) bad.push(`${p.slice(TMP.length + 5)}: ${re}`);
  }
}
await scan(join(TMP, 'out'));
const home = await readFile(join(TMP, 'out/index.html'), 'utf8');
const ok = home.includes('Atlas Treyler') && home.includes('>at.<');
await rm(TMP, { recursive: true, force: true });
if (bad.length || !ok) { console.error('MARKA SIZINTISI:\n' + (bad.slice(0, 20).join('\n') || '(yeni marka çıktıda yok)')); process.exit(1); }
console.log('✓ yalnızca content/ değişince tüm sayfalar yeni markayla çıktı, eski marka izi yok');
