import { BrowserEnvironment } from '../BrowserEnvironment.js'

export function isMacOS(browserEnvironment: BrowserEnvironment = new BrowserEnvironment()): boolean {
  const { navigator } = browserEnvironment

  return navigator ? /Mac/.test(navigator.platform) : false
}
