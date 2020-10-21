import { Node } from 'prosemirror-model'
import { ExtensionAttribute } from '../types'

export default function getRenderedAttributes(node: Node, attributes: ExtensionAttribute[]) {
  return attributes
    .filter(item => item.attribute.rendered)
    .map(item => {
      // TODO: fallback if renderHTML doesn’t exist
      return item.attribute.renderHTML(node.attrs)
    })
    .reduce((accumulator, value) => {
      // TODO: add support for "class" and "style" merge
      return {
        ...accumulator,
        ...value,
      }
    }, {})
}
