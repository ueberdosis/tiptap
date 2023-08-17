import { Mark, Node } from '@tiptap/pm/model'

import { ExtensionAttribute } from '../types.js'
import { mergeAttributes } from '../utilities/mergeAttributes.js'

export function getRenderedAttributes(
  nodeOrMark: Node | Mark,
  extensionAttributes: ExtensionAttribute[],
): Record<string, any> {
  return extensionAttributes
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
