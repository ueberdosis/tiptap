import { Node, Mark } from 'prosemirror-model'
import { ExtensionAttribute } from '../types'
import mergeAttributes from './mergeAttributes'

export default function getRenderedAttributes(nodeOrMark: Node | Mark, extensionAttributes: ExtensionAttribute[]): { [key: string]: any } {
  return extensionAttributes
    .filter(item => item.attribute.rendered)
    .map(item => {
      if (!item.attribute.renderHTML) {
        return {
          [`data-${item.name}`]: nodeOrMark.attrs[item.name],
        }
      }

      return item.attribute.renderHTML(nodeOrMark.attrs)
    })
    .reduce((attributes, attribute) => {
      return mergeAttributes(attributes, attribute)
    }, {})
}
