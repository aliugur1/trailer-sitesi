import RootShell from '@/components/RootShell';

// Birden çok kök yerleşim olduğu için 404 sayfası kendi <html> belgesini üretir
export default function GlobalNotFound() {
  return (
    <RootShell lang="tr">
      <main className="page-head"><h1>404</h1><p className="lead">Sayfa bulunamadı. / Page not found.</p></main>
    </RootShell>
  );
}
