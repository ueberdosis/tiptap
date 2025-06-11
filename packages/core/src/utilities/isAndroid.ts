import { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

export function isAndroid(browserEnvironment: BrowserEnvironmentManager = new BrowserEnvironmentManager()): boolean {
  return (
    browserEnvironment.navigator?.platform === 'Android' ||
    /android/i.test(browserEnvironment.navigator?.userAgent ?? '')
  )
}
