// Tanıtım filmi için gerçek sitenin kare kare çekimi (HyperFrames filminin ham görüntüsü).
// Üretim çıktısını (out/) yerel sunar, ana sayfayı ?film moduyla açar: sahne kareyi ve ilerlemeyi bu betik sürer (deterministik),
// yapılandırıcıda gerçek tıklamalar yapılır, sahte imleç kare başına elle konumlanır. Çıktı: video/assets/acts.mp4 + contact.png
// Kullanım: önce `next build`, sonra `node scripts/film-capture.mjs`  (FILM_FRAMES=60 ile kısa deneme)
// PW_CHROMIUM=/yol/chrome ile var olan Chromium kullanılır. WebGL yazılımla çizilir: uzun sürer (kare başına ~1 sn).
import { chromium } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';

const FPS = 30, W = 1920, H = 1080;
const DUR = 21; // saniye: sahne + yapılandırıcı çekimi
const LIMIT = process.env.FILM_FRAMES ? +process.env.FILM_FRAMES : DUR * FPS;
const OUT = 'video/assets';
const FR = `${OUT}/frames`;
const PORT = 5197;

const ease = (x) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
// ilerleme: 0-1 sn ilk ekran, sonra çizim perdesi, sonra yapılandırıcı
const progress = (t) => (t < 1 ? 0 : t < 6 ? 0.5 * ease((t - 1) / 5) : t < 7 ? 0.5 : t < 9 ? 0.5 + 0.4 * ease((t - 7) / 2) : 0.9);

const sel = (step, label) => `#config .cfg-group[data-step="${step}"] button:text-is("${label}")`;
const tab = (n) => `#config .cfg-steps button:nth-child(${n})`;
const ACTIONS = [
  { t: 10.0, click: sel(1, 'Tanker') },
  { t: 11.6, range: '#cfg-len', from: 13.6, to: 12.0, dur: 1.4 },
  { t: 14.0, click: tab(2) },
  { t: 15.0, click: sel(2, '4') },
  { t: 16.2, click: tab(3) },
  { t: 17.2, click: '#config .swatches button[aria-label="Sinyal sarısı"]' },
  { t: 18.6, click: sel(0, 'Yan') },
  { t: 19.8, click: tab(4) },
];
const LEAD = 0.6; // imleç hedefe bu kadar saniye önce yola çıkar

await rm(FR, { recursive: true, force: true });
await mkdir(FR, { recursive: true });
const server = spawn('node', ['scripts/serve-out.mjs'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1200));
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${PORT}/?film&hq`);
  await page.waitForFunction(() => window.__film && document.querySelector('#acts.live'));
  await page.evaluate(() => {
    scrollTo(0, document.querySelector('#acts').offsetTop + 2); // sahne yapışkan: görünür kalır
    const c = document.createElement('div');
    c.id = 'film-cursor';
    c.innerHTML = '<svg viewBox="0 0 24 24" width="64" height="64"><path d="M4 2l15 9-6.5 1.6L9.5 19z" fill="#13161b" stroke="#ffc400" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    c.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;pointer-events:none;opacity:0;transform:translate(960px,540px);transform-origin:4px 2px';
    document.body.append(c);
  });

  let cur = { x: 1500, y: 700 }; // imleç başlangıcı: sağ alt
  const pending = ACTIONS.map((a) => ({ ...a, started: false, done: false }));
  let press = 0;
  const center = async (selector) => { const b = await page.locator(selector).first().boundingBox(); return b && { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };

  for (let f = 0; f < LIMIT; f++) {
    const t = f / FPS;
    let target = null, a0 = null;
    for (const a of pending) {
      if (a.done) continue;
      if (a.click) {
        if (t >= a.t - LEAD && !a.started) { a.started = true; a.from = { ...cur }; a.to = await center(a.click); }
        if (a.started && t >= a.t - LEAD) { const k = ease((t - (a.t - LEAD)) / LEAD); if (t < a.t) { cur = { x: a.from.x + (a.to.x - a.from.x) * k, y: a.from.y + (a.to.y - a.from.y) * k }; } }
        if (t >= a.t && !a.done) { cur = a.to; await page.click(a.click); a.done = true; press = 6; await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); }
      } else if (a.range) {
        if (t >= a.t - LEAD && !a.started) { a.started = true; a.cf = { ...cur }; a.box = await page.locator(a.range).boundingBox(); }
        const frac = (v) => (v - 10.5) / (15 - 10.5);
        const thumb = (v) => ({ x: a.box.x + 12 + (a.box.width - 24) * frac(v), y: a.box.y + a.box.height / 2 });
        if (a.started && t < a.t) { const k = ease((t - (a.t - LEAD)) / LEAD); const to = thumb(a.from); cur = { x: a.cf.x + (to.x - a.cf.x) * k, y: a.cf.y + (to.y - a.cf.y) * k }; }
        if (t >= a.t && t <= a.t + a.dur) {
          const v = a.from + (a.to - a.from) * ease((t - a.t) / a.dur);
          cur = thumb(v);
          await page.evaluate((val) => { const el = document.querySelector('#cfg-len'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(val)); el.dispatchEvent(new Event('input', { bubbles: true })); }, v.toFixed(1));
        }
        if (t > a.t + a.dur) a.done = true;
      }
    }
    void target; void a0;
    await page.evaluate(([x, y, pr, now, p]) => {
      const c = document.querySelector('#film-cursor');
      c.style.opacity = now >= 9300 ? '1' : '0'; // imleç yapılandırıcıya girilince görünür
      c.style.transform = `translate(${x}px,${y}px) scale(${pr > 0 ? 0.82 : 1})`;
      window.__film.frame(now, p);
    }, [cur.x, cur.y, press, t * 1000, progress(t)]);
    if (press > 0) press--;
    await page.screenshot({ path: `${FR}/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
    if (f % 30 === 0) console.log(`kare ${f}/${LIMIT}`);
  }

  // yapılandırıcının "Teklif Al" bağlantısı: gerçek adres, formun hazır dolu hali
  const href = await page.locator('#config a.btn', { hasText: 'Teklif Al' }).getAttribute('href');
  await page.goto(`http://127.0.0.1:${PORT}${href}`);
  await page.addStyleTag({ content: '.float{display:none!important}' });
  await page.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in')); document.querySelector('#teklif').scrollIntoView(); });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/contact.png` });
  console.log('✓ contact.png', href);
} finally {
  await browser.close();
  server.kill();
}

if (!process.env.FILM_FRAMES) {
  execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', `${FR}/f%04d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-r', String(FPS), `${OUT}/acts.mp4`], { stdio: 'inherit' });
  console.log('✓ video/assets/acts.mp4');
}
