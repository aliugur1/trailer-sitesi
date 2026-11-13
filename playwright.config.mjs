import { defineConfig, devices } from '@playwright/test';

// E2E üretim çıktısını (out/) sınar: `npm run test:e2e` önce derler. Tarayıcı yoksa: npx playwright install chromium
// PW_CHROMIUM=/yol/chrome ile var olan bir Chromium kullanılabilir. WebGL yazılımla çizilir (GPU'suz ortam).
const executablePath = process.env.PW_CHROMIUM || undefined;
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    reducedMotion: 'reduce',
    launchOptions: { executablePath, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
  ],
  webServer: { command: 'node scripts/serve-out.mjs', url: 'http://127.0.0.1:5174', reuseExistingServer: false, timeout: 30_000 },
});
