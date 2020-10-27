import { ParseRule } from 'prosemirror-model'
import { ExtensionAttribute } from '../types'

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
            ? item.attribute.parseHTML(node as HTMLElement)
            : {
              [item.name]: (node as HTMLElement).getAttribute(item.name),
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
