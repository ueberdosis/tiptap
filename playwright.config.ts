import { defineConfig, devices } from '@playwright/test'

process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, '--require tsconfig-paths/register'].filter(Boolean).join(' ')

export default defineConfig({
  testDir: './demos',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['blob']] : [['line'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4080',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'pnpm -C demos run start:e2e',
    url: 'http://127.0.0.1:4080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
