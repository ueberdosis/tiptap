import { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

export function isMacOS(browserEnvironment: BrowserEnvironmentManager = new BrowserEnvironmentManager()): boolean {
  const { navigator } = browserEnvironment

  return navigator ? /Mac/.test(navigator.platform) : false
}
