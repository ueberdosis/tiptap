import { Node, Mark } from 'prosemirror-model'
import { ExtensionAttribute } from '../types'

export default function getRenderedAttributes(nodeOrMark: Node | Mark, extensionAttributes: ExtensionAttribute[]): { [key: string]: any } {
  return extensionAttributes
    .filter(item => item.attribute.rendered)
    .map(item => {
      // TODO: fallback if renderHTML doesn’t exist
      return item.attribute.renderHTML(nodeOrMark.attrs)
    })
    .reduce((attributes, attribute) => {
      // TODO: add support for "class" and "style" merge
      return {
        ...attributes,
        ...attribute,
      }
    }, {})
}
