import splitExtensions from './splitExtensions'
import {
  Extensions,
  GlobalAttributes,
  Attributes,
  Attribute,
  ExtensionAttribute,
} from '../types'

export default function getAttributesFromExtensions(extensions: Extensions) {
  const extensionAttributes: ExtensionAttribute[] = []
  const { nodeExtensions, markExtensions } = splitExtensions(extensions)
  const nodeAndMarkExtensions = [...nodeExtensions, ...markExtensions]
  const defaultAttribute: Required<Attribute> = {
    default: null,
    rendered: true,
    renderHTML: () => ({}),
    parseHTML: () => ({}),
  }

  extensions.forEach(extension => {
    const context = {
      options: extension.options,
    }

    const globalAttributes = extension.addGlobalAttributes.bind(context)() as GlobalAttributes

    globalAttributes.forEach(globalAttribute => {
      globalAttribute.types.forEach(type => {
        Object
          .entries(globalAttribute.attributes)
          .forEach(([name, attribute]) => {
            extensionAttributes.push({
              type,
              name,
              attribute: {
                ...defaultAttribute,
                ...attribute,
              },
            })
          })
      })
    })
  })

  nodeAndMarkExtensions.forEach(extension => {
    const context = {
      options: extension.options,
    }

    const attributes = extension.addAttributes.bind(context)() as Attributes

    Object
      .entries(attributes)
      .forEach(([name, attribute]) => {
        extensionAttributes.push({
          type: extension.name,
          name,
          attribute: {
            ...defaultAttribute,
            ...attribute,
          },
        })
      })
  })

  return extensionAttributes
}
