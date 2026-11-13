/** @type {import('next').NextConfig} */
export default {
  output: 'export', // backend yok: tamamen statik çıktı (out/)
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { globalNotFound: true }, // çoklu kök yerleşimde 404 için
};
