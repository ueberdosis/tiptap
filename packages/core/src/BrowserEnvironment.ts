import type { BrowserEnvironment } from './types.js'

/**
 * Browser environment manager that provides access to browser APIs
 * with fallbacks for server-side environments
 */
export class BrowserEnvironmentManager {
  private environment: BrowserEnvironment

  constructor(environment: BrowserEnvironment = {}) {
    this.environment = environment
  }

  /**
   * Get the window object (browser window or injected window)
   */
  get window(): Window | undefined {
    return this.environment.window ?? (typeof window !== 'undefined' ? window : undefined)
  }

  /**
   * Get the document object (browser document or injected document)
   */
  get document(): Document | undefined {
    return this.window?.document ?? (typeof document !== 'undefined' ? document : undefined)
  }

  /**
   * Get the navigator object (browser navigator or injected navigator)
   */
  get navigator(): Navigator | undefined {
    return this.window?.navigator ?? (typeof navigator !== 'undefined' ? navigator : undefined)
  }

  /**
   * Get the DOMParser constructor (browser DOMParser or injected DOMParser)
   */
  get DOMParser(): typeof DOMParser | undefined {
    return this.environment.domParser ?? (typeof window !== 'undefined' ? window.DOMParser : undefined)
  }
}
