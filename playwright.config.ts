import { defineConfig } from '@playwright/test'

process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, '--require tsconfig-paths/register'].filter(Boolean).join(' ')

export default defineConfig({
  testDir: './demos',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['line']],
  use: {
    baseURL: 'http://127.0.0.1:4080',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm -C demos run start:demos',
    url: 'http://127.0.0.1:4080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
