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
    return (this.environment.window ?? typeof window !== 'undefined') ? window : undefined
  }

  /**
   * Get the document object (browser document or injected document)
   */
  get document(): Document | undefined {
    return (this.window?.document ?? typeof document !== 'undefined') ? document : undefined
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
    return this.environment.domParser ?? (typeof DOMParser !== 'undefined' ? DOMParser : undefined)
  }

  /**
   * Get requestAnimationFrame function
   */
  // TODO delete
  get requestAnimationFrame(): typeof requestAnimationFrame {
    return this.window?.requestAnimationFrame ?? requestAnimationFrame
  }

  /**
   * Check if we're in a browser environment
   */
  get isBrowser(): boolean {
    return typeof window === 'object' && typeof document === 'object'
  }

  /**
   * Check if we're in a server environment with injected APIs
   */
  get isServerWithAPIs(): boolean {
    return !this.isBrowser && Boolean(this.environment.window)
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
   * Add event listener if element supports it
   */
  addEventListener(element: any, event: string, handler: any, options?: boolean | any): void {
    this.safeExecute(() => {
      if (element && typeof element.addEventListener === 'function') {
        element.addEventListener(event, handler, options)
      }
    })
  }
}
