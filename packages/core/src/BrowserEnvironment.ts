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
  get window(): Window | any {
    return this.environment.window ?? (typeof window !== 'undefined' ? window : undefined)
  }

  /**
   * Get the document object (browser document or injected document)
   */
  get document(): Document | any {
    return this.window?.document ?? (typeof document !== 'undefined' ? document : undefined)
  }

  /**
   * Get the navigator object (browser navigator or injected navigator)
   */
  get navigator(): Navigator | any {
    return this.window?.navigator ?? (typeof navigator !== 'undefined' ? navigator : undefined)
  }

  /**
   * Get the DOMParser constructor (browser DOMParser or injected DOMParser)
   */
  get DOMParser(): typeof DOMParser | any {
    return this.window?.DOMParser ?? (typeof DOMParser !== 'undefined' ? DOMParser : undefined)
  }

  /**
   * Get requestAnimationFrame function
   */
  get requestAnimationFrame(): typeof requestAnimationFrame | any {
    return (
      this.window?.requestAnimationFrame ??
      (typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : undefined)
    )
  }

  /**
   * Get setTimeout function (available in both browser and Node.js)
   */
  get setTimeout(): typeof setTimeout | any {
    return this.window?.setTimeout ?? (typeof setTimeout !== 'undefined' ? setTimeout : undefined)
  }

  /**
   * Check if we're in a browser environment
   */
  get isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined'
  }

  /**
   * Check if we're in a server environment with injected APIs
   */
  get isServerWithAPIs(): boolean {
    return !this.isBrowser && !!this.environment.window
  }

  /**
   * Check if we have a valid environment (browser or server with injected APIs)
   */
  get hasValidEnvironment(): boolean {
    return this.isBrowser || this.isServerWithAPIs
  }

  /**
   * Safely execute a function that requires browser APIs
   * @param fn Function to execute
   * @param fallback Fallback value if APIs are not available
   */
  safeExecute<T>(fn: () => T, fallback?: T): T | undefined {
    try {
      if (this.hasValidEnvironment) {
        return fn()
      }
      return fallback
    } catch (error) {
      console.warn('[tiptap]: Browser API call failed in headless environment:', error)
      return fallback
    }
  }

  /**
   * Create a style element if document is available
   */
  createElement(tagName: string): Element | undefined {
    return this.safeExecute(() => this.document?.createElement(tagName))
  }

  /**
   * Query selector if document is available
   */
  querySelector(selector: string): Element | null | undefined {
    return this.safeExecute(() => this.document?.querySelector(selector))
  }

  /**
   * Add event listener if element supports it
   */
  addEventListener(
    element: any,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this.safeExecute(() => {
      if (element && typeof element.addEventListener === 'function') {
        element.addEventListener(event, handler, options)
      }
    })
  }

  /**
   * Remove event listener if element supports it
   */
  removeEventListener(
    element: any,
    event: string,
    handler: EventListener,
    options?: boolean | EventListenerOptions,
  ): void {
    this.safeExecute(() => {
      if (element && typeof element.removeEventListener === 'function') {
        element.removeEventListener(event, handler, options)
      }
    })
  }

  /**
   * Get bounding client rect if element supports it
   */
  getBoundingClientRect(element: any): DOMRect | undefined {
    return this.safeExecute(() => {
      if (element && typeof element.getBoundingClientRect === 'function') {
        return element.getBoundingClientRect()
      }
      return undefined
    })
  }

  /**
   * Focus an element if it supports focus
   */
  focus(element: any): void {
    this.safeExecute(() => {
      if (element && typeof element.focus === 'function') {
        element.focus()
      }
    })
  }

  /**
   * Blur an element if it supports blur
   */
  blur(element: any): void {
    this.safeExecute(() => {
      if (element && typeof element.blur === 'function') {
        element.blur()
      }
    })
  }
}
