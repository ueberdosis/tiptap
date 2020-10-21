import {
  Extensions, Attributes, Attribute, ExtensionAttribute,
} from '../types'
import splitExtensions from './splitExtensions'

export default function getAttributesFromExtensions(extensions: Extensions) {
  const allAttributes: ExtensionAttribute[] = []

  const { nodeExtensions } = splitExtensions(extensions)

  const defaultAttribute: Required<Attribute> = {
    default: null,
    rendered: true,
    renderHTML: () => ({}),
    parseHTML: () => null,
  }

  nodeExtensions.forEach(extension => {
    const context = {
      options: extension.options,
    }

    const attributes = extension.createAttributes.bind(context)() as Attributes

    Object.entries(attributes).forEach(([name, attribute]) => {
      allAttributes.push({
        type: extension.name,
        name,
        attribute: {
          ...defaultAttribute,
          ...attribute,
        },
      })
    })
  })

  return allAttributes
}
