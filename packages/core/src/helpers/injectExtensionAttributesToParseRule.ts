import type { ParseRule } from '@tiptap/pm/model'

import type { ExtensionAttribute } from '../types.js'
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
  if ('style' in parseRule) {
    return parseRule
  }

  return {
    ...parseRule,
    getAttrs: (node: HTMLElement) => {
      const oldAttributes = parseRule.getAttrs ? parseRule.getAttrs(node) : parseRule.attrs

      if (oldAttributes === false) {
        return false
      }

      const newAttributes = extensionAttributes.reduce((items, item) => {
        const value = item.attribute.parseHTML
          ? item.attribute.parseHTML(node)
          : fromString(node.getAttribute(item.name))

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
