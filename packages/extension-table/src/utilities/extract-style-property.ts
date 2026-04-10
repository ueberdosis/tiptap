/**
 * Extracts a CSS property value from a raw inline `style` attribute string.
 * Prefers the last declaration if the property appears multiple times.
 * Falls back to null if the property is not found.
 *
 * @param styleAttr - The raw `style` attribute string from the element
 * @param property - The CSS property name to extract (e.g. `"background-color"`)
 * @return The property value string, or null if not found
 */
export function extractStyleProperty(styleAttr: string | null, property: string): string | null {
  if (!styleAttr) {
    return null
  }

  const decls = styleAttr
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)

  // Walk backwards so the last declaration wins (child overrides parent in merged spans)
  for (let i = decls.length - 1; i >= 0; i -= 1) {
    const parts = decls[i].split(':')

    if (parts.length >= 2) {
      const prop = parts[0].trim().toLowerCase()
      const val = parts.slice(1).join(':').trim()

      if (prop === property) {
        return val.replace(/['"]+/g, '')
      }
    }
  }

  return null
}
