/**
 * Detects if the current browser is Firefox.
 * @returns `true` if the browser is Firefox, `false` otherwise.
 * @example
 * if (isFirefox()) {
 *   // Firefox-specific handling
 * }
 */
export function isFirefox(): boolean {
  return typeof navigator !== 'undefined' ? /Firefox/.test(navigator.userAgent) : false
}
