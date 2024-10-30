import { Mark, Node } from '@tiptap/pm/model'

import { ExtensionAttribute } from '../types.js'
import { mergeAttributes } from '../utilities/mergeAttributes.js'

export function getRenderedAttributes(
  nodeOrMark: Node | Mark,
  extensionAttributes: ExtensionAttribute[],
  addTypeAttributes = false,
): Record<string, any> {
  const attributes = extensionAttributes
    .filter(
      attribute => attribute.type === nodeOrMark.type.name,
    )
    .filter(item => item.attribute.rendered)
    .map(item => {
      if (!item.attribute.renderHTML) {
        return {
          [item.name]: nodeOrMark.attrs[item.name],
        }
      }

      return item.attribute.renderHTML(nodeOrMark.attrs) || {}
    })
    .reduce((currentAttributes, attribute) => mergeAttributes(currentAttributes, attribute), {})

  if (addTypeAttributes) {
    attributes['data-node-type'] = nodeOrMark.type.name
  }

  return attributes
}
