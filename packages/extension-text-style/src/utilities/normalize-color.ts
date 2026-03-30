/**
 * Normalize a CSS color value to a canonical form using the browser's
 * built-in CSS parser.  The browser always returns colors in `rgb(…)` or
 * `rgba(…)` format, which gives us a stable representation that won't
 * change across re-parses (e.g. during IME composition).
 *
 * Falls back to the original value when `document` is unavailable (SSR).
 */
export function normalizeColor(color: string): string {
  if (typeof document === 'undefined') {
    return color
  }

  const temp = document.createElement('span')

  temp.style.color = color

  return temp.style.color || color
}
