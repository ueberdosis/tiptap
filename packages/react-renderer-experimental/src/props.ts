import type { CSSProperties } from 'react'

/** `style="border-color: red"` -> `{ borderColor: 'red' }` */
const styleStringToObject = (style: string): CSSProperties => {
  const result: Record<string, string> = {}

  style.split(';').forEach(rule => {
    const separator = rule.indexOf(':')

    if (separator === -1) {
      return
    }
    const property = rule.slice(0, separator).trim()
    const value = rule.slice(separator + 1).trim()

    if (!property || !value) {
      return
    }
    // Custom properties keep their name; regular ones become camelCase
    const key = property.startsWith('--')
      ? property
      : property.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase())

    result[key] = value
  })
  return result as CSSProperties
}

/**
 * Converts a ProseMirror `toDOM` attribute record into React DOM props.
 * Handles the attribute names React renames; everything else (including
 * `data-*` and `aria-*`) passes through unchanged.
 */
export const attributesToProps = (
  attrs: Record<string, string | number | boolean | null | undefined> | undefined,
): Record<string, unknown> => {
  const props: Record<string, unknown> = {}

  if (!attrs) {
    return props
  }

  Object.entries(attrs).forEach(([name, value]) => {
    if (value === null || value === undefined) {
      return
    }
    if (name === 'class') {
      props.className = value
    } else if (name === 'style' && typeof value === 'string') {
      props.style = styleStringToObject(value)
    } else if (name === 'for') {
      props.htmlFor = value
    } else {
      props[name] = value
    }
  })
  return props
}
