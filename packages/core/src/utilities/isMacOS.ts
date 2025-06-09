import { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

export function isMacOS(browserEnv: BrowserEnvironmentManager = new BrowserEnvironmentManager()): boolean {
  const { navigator } = browserEnv

  return navigator ? /Mac/.test(navigator.platform) : false
}
