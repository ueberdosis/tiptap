/**
 * @fileoverview Utility functions for parsing and serializing markdown attributes.
 *
 * These utilities handle the common patterns for parsing attribute strings
 * in various markdown syntaxes like Pandoc attributes.
 */

/**
 * Parses a Pandoc-style attribute string into an object.
 *
 * Supports the following patterns:
 * - Classes: `.className` → `{ class: 'className' }`
 * - IDs: `#myId` → `{ id: 'myId' }`
 * - Key-value pairs: `key="value"` → `{ key: 'value' }`
 * - Boolean attributes: `disabled` → `{ disabled: true }`
 *
 * @param attrString - The attribute string to parse
 * @returns Parsed attributes object
 *
 * @example
 * ```ts
 * parseAttributes('.btn #submit disabled type="button"')
 * // → { class: 'btn', id: 'submit', disabled: true, type: 'button' }
 * ```
 */
export function parseAttributes(attrString: string): Record<string, any> {
  if (!attrString?.trim()) {
    return {}
  }

  const attributes: Record<string, any> = {}

  // First, extract and remove quoted strings to avoid parsing content inside them
  const quotedStrings: string[] = []
  const tempString = attrString.replace(/["']([^"']*)["']/g, match => {
    quotedStrings.push(match)
    return `__QUOTED_${quotedStrings.length - 1}__`
  })

  // Parse classes (.className) - only outside of quoted strings
  const classMatches = tempString.match(/(?:^|\s)\.([a-zA-Z][\w-]*)/g)
  if (classMatches) {
    const classes = classMatches.map(match => match.trim().slice(1)) // Remove the dot
    attributes.class = classes.join(' ')
  }

  // Parse IDs (#myId) - only outside of quoted strings
  const idMatch = tempString.match(/(?:^|\s)#([a-zA-Z][\w-]*)/)
  if (idMatch) {
    attributes.id = idMatch[1]
  }

  // Parse key-value pairs (key="value" or key='value') - restore quoted strings
  const kvRegex = /([a-zA-Z][\w-]*)\s*=\s*(__QUOTED_\d+__)/g
  const kvMatches = Array.from(tempString.matchAll(kvRegex))
  kvMatches.forEach(([, key, quotedRef]) => {
    const quotedIndex = parseInt(quotedRef.match(/__QUOTED_(\d+)__/)?.[1] || '0', 10)
    const quotedValue = quotedStrings[quotedIndex]
    if (quotedValue) {
      // Remove the outer quotes
      attributes[key] = quotedValue.slice(1, -1)
    }
  })

  // Parse boolean attributes (standalone words that aren't classes/IDs)
  const cleanString = tempString
    .replace(/(?:^|\s)\.([a-zA-Z][\w-]*)/g, '') // Remove classes
    .replace(/(?:^|\s)#([a-zA-Z][\w-]*)/g, '') // Remove IDs
    .replace(/([a-zA-Z][\w-]*)\s*=\s*__QUOTED_\d+__/g, '') // Remove key-value pairs
    .trim()

  if (cleanString) {
    const booleanAttrs = cleanString.split(/\s+/).filter(Boolean)
    booleanAttrs.forEach(attr => {
      if (attr.match(/^[a-zA-Z][\w-]*$/)) {
        attributes[attr] = true
      }
    })
  }

  return attributes
}

/**
 * Serializes an attributes object back to a Pandoc-style attribute string.
 *
 * @param attributes - The attributes object to serialize
 * @returns Serialized attribute string
 *
 * @example
 * ```ts
 * serializeAttributes({ class: 'btn primary', id: 'submit', disabled: true, type: 'button' })
 * // → '.btn.primary #submit disabled type="button"'
 * ```
 */
export function serializeAttributes(attributes: Record<string, any>): string {
  if (!attributes || Object.keys(attributes).length === 0) {
    return ''
  }

  const parts: string[] = []

  // Handle classes
  if (attributes.class) {
    const classes = String(attributes.class).split(/\s+/).filter(Boolean)
    classes.forEach(cls => parts.push(`.${cls}`))
  }

  // Handle ID
  if (attributes.id) {
    parts.push(`#${attributes.id}`)
  }

  // Handle other attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'class' || key === 'id') {
      return // Already handled
    }

    if (value === true) {
      // Boolean attribute
      parts.push(key)
    } else if (value !== false && value != null) {
      // Key-value attribute
      parts.push(`${key}="${String(value)}"`)
    }
  })

  return parts.join(' ')
}
