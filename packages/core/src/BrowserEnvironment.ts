/**
 * Configuration options for the browser environment. Overrides browser APIs
 * like `window` with a custom implementation.
 */
export interface BrowserEnvironmentOptions {
  /**
   * Custom implementation of the `window` object
   */
  window?: Window

  /**
   * Custom implementation of the `DOMParser` class constructor
   */
  domParser?: typeof DOMParser
}

/**
 * Provides access to browser APIs or virtual DOM implementations for
 * server-side usage.
 */
export class BrowserEnvironment {
  /**
   * Initial configuration for the browser environment, provided in the editor
   * options.
   */
  private options: BrowserEnvironmentOptions

  constructor(options: BrowserEnvironmentOptions = {}) {
    this.options = options
  }

  /**
   * Get the window object (browser window or injected window)
   */
  get window(): Window | undefined {
    return this.options.window ?? (typeof window !== 'undefined' ? window : undefined)
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
    return this.options.domParser ?? (typeof window !== 'undefined' ? window.DOMParser : undefined)
  }
}
