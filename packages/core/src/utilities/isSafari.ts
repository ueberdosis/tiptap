/**
 * Detects if the current browser is Safari (but not iOS Safari or Chrome).
 * @returns `true` if the browser is Safari, `false` otherwise.
 * @example
 * if (isSafari()) {
 *   // Safari-specific handling
 * }
 */
export function isSafari(): boolean {
  return typeof navigator !== 'undefined' ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : false
}
