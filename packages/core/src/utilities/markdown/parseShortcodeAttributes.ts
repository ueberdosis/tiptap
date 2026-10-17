import { tokenizeAttributes } from './tokenizeAttributes.js'

export function parseShortcodeAttributes(attrString: string): Record<string, any> {
  const attributes: Record<string, any> = {}

  tokenizeAttributes(attrString, 'shortcode').forEach(token => {
    if (token.type === 'keyValue') {
      attributes[token.name] = token.value
    }
  })

  return attributes
}
