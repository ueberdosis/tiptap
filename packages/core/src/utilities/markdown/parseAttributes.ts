import type { AttributeToken } from './tokenizeAttributes.js'
import { tokenizeAttributes } from './tokenizeAttributes.js'

function applyTokens(tokens: AttributeToken[]): Record<string, any> {
  const attributes: Record<string, any> = {}
  const classes = tokens.filter(token => token.type === 'class').map(token => token.name)
  const id = tokens.find(token => token.type === 'id')

  if (classes.length > 0) {
    attributes.class = classes.join(' ')
  }
  if (id) {
    attributes.id = id.name
  }

  tokens.forEach(token => {
    if (token.type === 'keyValue') {
      attributes[token.name] = token.value
    }
  })
  tokens.forEach(token => {
    if (token.type === 'boolean') {
      attributes[token.name] = true
    }
  })

  return attributes
}

/**
 * Parses a Pandoc-style attribute string into an object.
 *
 * @param attrString - The attribute string to parse
 * @returns Parsed attributes object
 *
 * @example
 * ```ts
 * parseAttributes('.btn #submit disabled type="button"')
 * // { class: 'btn', id: 'submit', disabled: true, type: 'button' }
 * ```
 */
export function parseAttributes(attrString: string): Record<string, any> {
  if (!attrString?.trim()) {
    return {}
  }

  return applyTokens(tokenizeAttributes(attrString, 'pandoc'))
}
