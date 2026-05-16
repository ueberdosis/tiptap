import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PORT ?? 3000)
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`

const useBuildPreview = process.env.PLAYWRIGHT_USE_BUILD === '1'

export default defineConfig({
  testDir: '.',
  testMatch: ['demos/**/*.spec.ts', 'tests/e2e/**/*.spec.ts'],
  testIgnore: ['**/node_modules/**', 'packages/**', 'packages-deprecated/**', '**/dist/**'],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',

  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: useBuildPreview
      ? `pnpm exec http-server ./demos/dist -s -p ${port}`
      : `pnpm --prefix demos start -- --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
