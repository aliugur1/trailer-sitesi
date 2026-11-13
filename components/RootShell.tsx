import Script from 'next/script';
import Float from '@/components/Float';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { SITE } from '@/content/site';
import type { Lang } from '@/lib/i18n';
import '@/app/globals.css';

// Her dilin kök yerleşimi: <html lang> sunucuda doğru basılır (SEO)
export default function RootShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang}>
      <head>
        {/* başlık yazı tipi geç gelip metni yeniden boyamasın (LCP) */}
        <link rel="preload" href="/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/archivo-latin-ext-wdth-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <Header lang={lang} />
        {children}
        <Footer lang={lang} />
        <Float lang={lang} />
        {SITE.analitik.plausible && <Script defer data-domain={SITE.analitik.plausible} src="https://plausible.io/js/script.js" strategy="afterInteractive" />}
      </body>
    </html>
  );
}
