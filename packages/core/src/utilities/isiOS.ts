import type { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

export function isiOS(browserEnv?: BrowserEnvironmentManager): boolean {
  const nav = browserEnv?.navigator ?? (typeof navigator !== 'undefined' ? navigator : undefined)
  const doc = browserEnv?.document ?? (typeof document !== 'undefined' ? document : undefined)

  if (!nav) {
    return false
  }

  return (
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(nav.platform) ||
    // iPad on iOS 13 detection
    (nav.userAgent.includes('Mac') && doc && 'ontouchend' in doc)
  )
}
