import { BrowserEnvironment } from '../BrowserEnvironment.js'

export function isiOS(browserEnvironment: BrowserEnvironment = new BrowserEnvironment()): boolean {
  const { navigator, document } = browserEnvironment

  if (!navigator) {
    return false
  }

  return Boolean(
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(
      navigator.platform ?? '',
    ) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes('Mac') && document && 'ontouchend' in document),
  )
}
