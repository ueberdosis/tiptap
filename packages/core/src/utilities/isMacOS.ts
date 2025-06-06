import type { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

export function isMacOS(browserEnv?: BrowserEnvironmentManager): boolean {
  const nav = browserEnv?.navigator ?? (typeof navigator !== 'undefined' ? navigator : undefined)

  return nav ? /Mac/.test(nav.platform) : false
}
