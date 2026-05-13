/**
 * Read a CSS property value directly from an element's raw inline `style`
 * attribute, bypassing the CSSOM (e.g. `element.style.fontFamily`) which
 * canonicalizes values and can change formatting. The original format is
 * preserved (quotes, hex vs rgb, etc.).
 *
 * When a property is declared more than once, the last declaration wins —
 * this matches CSS cascade order and is useful when nested spans are merged
 * and the child's value should take priority.
 *
 * Property name comparison is case-insensitive.
 *
 * @param element - The element whose `style` attribute should be read.
 * @param propertyName - The CSS property name (e.g. `font-family`).
 * @returns The raw value string, or `null` if the property is not present.
 *
 * @example
 * ```ts
 * parseHTML: element => getStyleProperty(element, 'font-family')
 * ```
 */
export function getStyleProperty(element: HTMLElement, propertyName: string): string | null {
  const styleAttr = element.getAttribute('style')

  if (!styleAttr) {
    return null
  }

  const decls = styleAttr
    .split(';')
    .map(decl => decl.trim())
    .filter(Boolean)

  const target = propertyName.toLowerCase()

  for (let i = decls.length - 1; i >= 0; i -= 1) {
    const decl = decls[i]
    const colonIndex = decl.indexOf(':')

    if (colonIndex === -1) {
      continue
    }

    const prop = decl.slice(0, colonIndex).trim().toLowerCase()

    if (prop === target) {
      return decl.slice(colonIndex + 1).trim()
    }
  }

  return null
}
