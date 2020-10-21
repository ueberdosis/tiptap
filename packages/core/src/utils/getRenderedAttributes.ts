import { Node } from 'prosemirror-model'
import { ExtensionAttribute } from '../types'

export default function getRenderedAttributes(node: Node, attributes: ExtensionAttribute[]) {
  return attributes
    .map(attribute => {
      // TODO: fallback if renderHTML doesn’t exist
      return attribute.attribute.renderHTML(node.attrs)
    })
    .reduce((accumulator, value) => {
      // TODO: add support for "class" merge
      return {
        ...accumulator,
        ...value,
      }
    }, {})
}
