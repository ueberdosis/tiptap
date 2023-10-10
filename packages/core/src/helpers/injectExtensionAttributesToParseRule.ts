import { ParseRule } from '@tiptap/pm/model'

import { ExtensionAttribute } from '../types.js'
import { fromString } from '../utilities/fromString.js'

/**
 * This function merges extension attributes into parserule attributes (`attrs` or `getAttrs`).
 * Cancels when `getAttrs` returned `false`.
 * @param parseRule ProseMirror ParseRule
 * @param extensionAttributes List of attributes to inject
 */
export function injectExtensionAttributesToParseRule(
  parseRule: ParseRule,
  extensionAttributes: ExtensionAttribute[],
): ParseRule {
  if (parseRule.style) {
    return parseRule
  }

  return {
    ...parseRule,
    getAttrs: node => {
      const oldAttributes = parseRule.getAttrs ? parseRule.getAttrs(node) : parseRule.attrs

      if (oldAttributes === false) {
        return false
      }

      const newAttributes = extensionAttributes.reduce((items, item) => {
        const value = item.attribute.parseHTML
          ? item.attribute.parseHTML(node as HTMLElement)
          : fromString((node as HTMLElement).getAttribute(item.name))

        if (value === null || value === undefined) {
          return items
        }

        return {
          ...items,
          [item.name]: value,
        }
      }, {})

      return { ...oldAttributes, ...newAttributes }
    },
  }
}
