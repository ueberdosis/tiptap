/**
 * Serializes an attributes object to a Pandoc-style attribute string.
 *
 * @param attributes - The attributes object to serialize
 * @returns Serialized attribute string
 *
 * @example
 * ```ts
 * serializeAttributes({ class: 'btn primary', id: 'submit', disabled: true, type: 'button' })
 * // '.btn .primary #submit disabled type="button"'
 * ```
 */
export function serializeAttributes(attributes: Record<string, any>): string {
  if (!attributes || Object.keys(attributes).length === 0) {
    return ''
  }

  const parts: string[] = []

  if (attributes.class) {
    const classes = String(attributes.class).split(/\s+/).filter(Boolean)
    classes.forEach(className => parts.push(`.${className}`))
  }

  if (attributes.id) {
    parts.push(`#${attributes.id}`)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'class' || key === 'id') {
      return
    }

    if (value === true) {
      parts.push(key)
    } else if (value !== false && value != null) {
      parts.push(`${key}="${String(value)}"`)
    }
  })

  return parts.join(' ')
}
