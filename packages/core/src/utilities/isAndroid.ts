import { BrowserEnvironment } from '../BrowserEnvironment.js'

export function isAndroid(browserEnvironment: BrowserEnvironment = new BrowserEnvironment()): boolean {
  return (
    browserEnvironment.navigator?.platform === 'Android' ||
    /android/i.test(browserEnvironment.navigator?.userAgent ?? '')
  )
}
