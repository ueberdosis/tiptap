import { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

export function isAndroid(browserEnv: BrowserEnvironmentManager = new BrowserEnvironmentManager()): boolean {
  return browserEnv.navigator?.platform === 'Android' || /android/i.test(browserEnv.navigator?.userAgent ?? '')
}
