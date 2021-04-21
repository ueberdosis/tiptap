import { ParseRule } from 'prosemirror-model'
import { ExtensionAttribute } from '../types'
import fromString from '../utilities/fromString'

/**
 * This function merges extension attributes into parserule attributes (`attrs` or `getAttrs`).
 * Cancels when `getAttrs` returned `false`.
 * @param parseRule ProseMirror ParseRule
 * @param extensionAttributes List of attributes to inject
 */
export default function injectExtensionAttributesToParseRule(parseRule: ParseRule, extensionAttributes: ExtensionAttribute[]): ParseRule {
  if (parseRule.style) {
    return parseRule
  }

  return {
    ...parseRule,
    getAttrs: node => {
      const oldAttributes = parseRule.getAttrs
        ? parseRule.getAttrs(node)
        : parseRule.attrs

      if (oldAttributes === false) {
        return false
      }

      const newAttributes = extensionAttributes
        .filter(item => item.attribute.rendered)
        .reduce((items, item) => {
          const attributes = item.attribute.parseHTML
            ? item.attribute.parseHTML(node as HTMLElement) || {}
            : {
              [item.name]: fromString((node as HTMLElement).getAttribute(item.name)),
            }

          const filteredAttributes = Object.fromEntries(Object.entries(attributes)
            .filter(([, value]) => value !== undefined && value !== null))

          return {
            ...items,
            ...filteredAttributes,
          }
        }, {})

      return { ...oldAttributes, ...newAttributes }
    },
  }
}
