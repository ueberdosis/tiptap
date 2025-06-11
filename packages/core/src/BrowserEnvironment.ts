import type { BrowserEnvironment } from './types.js'

/**
 * Browser environment manager that provides access to browser APIs or virtual
 * DOM implementations for server-side usage.
 */
export class BrowserEnvironmentManager {
  /**
   * Initial configuration for the browser environment, provided in the editor
   * options.
   */
  private browserEnvironment: BrowserEnvironment

  constructor(browserEnvironment: BrowserEnvironment = {}) {
    this.browserEnvironment = browserEnvironment
  }

  /**
   * Get the window object (browser window or injected window)
   */
  get window(): Window | undefined {
    return this.browserEnvironment.window ?? (typeof window !== 'undefined' ? window : undefined)
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
    return this.browserEnvironment.domParser ?? (typeof window !== 'undefined' ? window.DOMParser : undefined)
  }
}
