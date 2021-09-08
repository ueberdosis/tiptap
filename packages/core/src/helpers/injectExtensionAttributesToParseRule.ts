import { ParseRule } from 'prosemirror-model'
import { ExtensionAttribute } from '../types'
import fromString from '../utilities/fromString'
import isObject from '../utilities/isObject'

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
          const value = item.attribute.parseHTML
            ? item.attribute.parseHTML(node as HTMLElement)
            : fromString((node as HTMLElement).getAttribute(item.name))

          if (isObject(value)) {
            console.warn(`[tiptap warn]: BREAKING CHANGE: "parseHTML" for your attribute "${item.name}" returns an object but should return the value itself. If this is expected you can ignore this message. This warning will be removed in one of the next releases. Further information: https://github.com/ueberdosis/tiptap/issues/1863`)
          }

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
