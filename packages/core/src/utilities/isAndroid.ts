import type { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

export function isAndroid(browserEnv?: BrowserEnvironmentManager): boolean {
  const nav = browserEnv?.navigator ?? (typeof navigator !== 'undefined' ? navigator : undefined)

  if (!nav) {
    return false
  }

  return nav.platform === 'Android' || /android/i.test(nav.userAgent)
}
