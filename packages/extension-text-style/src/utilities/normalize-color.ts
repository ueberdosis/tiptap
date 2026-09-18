/**
 * A singleton span element reused across all normalizeColor calls to avoid
 * creating a new DOM element on every invocation.
 */
let singletonSpan: HTMLSpanElement | null = null

/**
 * Cache of already-normalized color values so repeated lookups are free.
 */
const colorCache = new Map<string, string>()

/**
 * Normalize a CSS color value to a canonical form using the browser's
 * built-in CSS parser.  The browser always returns colors in `rgb(…)` or
 * `rgba(…)` format, which gives us a stable representation that won't
 * change across re-parses (e.g. during IME composition).
 *
 * Uses a singleton `<span>` element and an in-memory cache for performance.
 *
 * Falls back to the original value when `document` is unavailable (SSR).
 */
export function normalizeColor(color: string): string {
  if (typeof document === 'undefined') {
    return color
  }

  const cached = colorCache.get(color)

  if (cached !== undefined) {
    return cached
  }

  if (!singletonSpan) {
    singletonSpan = document.createElement('span')
  }

  singletonSpan.style.color = ''
  singletonSpan.style.color = color

  const normalized = singletonSpan.style.color || color

  colorCache.set(color, normalized)

  return normalized
}
