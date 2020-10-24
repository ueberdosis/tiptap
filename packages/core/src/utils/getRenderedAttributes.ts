import { Node, Mark } from 'prosemirror-model'
import { ExtensionAttribute } from '../types'
import mergeAttributes from './mergeAttributes'
import isEmptyObject from './isEmptyObject'

export default function getRenderedAttributes(nodeOrMark: Node | Mark, extensionAttributes: ExtensionAttribute[]): { [key: string]: any } {
  return extensionAttributes
    .filter(item => item.attribute.rendered)
    .map(item => {
      const renderedAttributes = item.attribute.renderHTML(nodeOrMark.attrs)

      if (isEmptyObject(renderedAttributes)) {
        return {
          [`data-${item.name}`]: nodeOrMark.attrs[item.name],
        }
      }

      return renderedAttributes
    })
    .reduce((attributes, attribute) => {
      return mergeAttributes(attributes, attribute)
    }, {})
}
