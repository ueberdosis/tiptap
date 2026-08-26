import type { Mark, Node as PMNode } from '@tiptap/pm/model'

import type { ExtensionAttribute } from '../types.js'
import { mergeAttributes } from '../utilities/mergeAttributes.js'

export function getRenderedAttributes(
  nodeOrMark: PMNode | Mark,
  extensionAttributes: ExtensionAttribute[],
): Record<string, any> {
  return extensionAttributes
    .filter(attribute => attribute.type === nodeOrMark.type.name)
    .filter(item => item.attribute.rendered)
    .map(item => {
      if (!item.attribute.renderHTML) {
        return {
          [item.name]: nodeOrMark.attrs[item.name],
        }
      }

      return item.attribute.renderHTML(nodeOrMark.attrs) || {}
    })
    .reduce((attributes, attribute) => mergeAttributes(attributes, attribute), {})
}
