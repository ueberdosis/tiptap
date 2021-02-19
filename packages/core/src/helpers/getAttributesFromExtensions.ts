import splitExtensions from './splitExtensions'
import {
  Extensions,
  GlobalAttributes,
  Attributes,
  Attribute,
  ExtensionAttribute,
} from '../types'

/**
 * Get a list of all extension attributes defined in `addAttribute` and `addGlobalAttribute`.
 * @param extensions List of extensions
 */
export default function getAttributesFromExtensions(extensions: Extensions): ExtensionAttribute[] {
  const extensionAttributes: ExtensionAttribute[] = []
  const { nodeExtensions, markExtensions } = splitExtensions(extensions)
  const nodeAndMarkExtensions = [...nodeExtensions, ...markExtensions]
  const defaultAttribute: Required<Attribute> = {
    default: null,
    rendered: true,
    renderHTML: null,
    parseHTML: null,
    keepOnSplit: true,
  }

  extensions.forEach(extension => {
    const context = {
      options: extension.options,
    }

    if (!extension.config.addGlobalAttributes) {
      return
    }

    const globalAttributes = extension.config.addGlobalAttributes.bind(context)() as GlobalAttributes

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

    if (!extension.config.addAttributes) {
      return
    }

    const attributes = extension.config.addAttributes.bind(context)() as Attributes

    Object
      .entries(attributes)
      .forEach(([name, attribute]) => {
        extensionAttributes.push({
          type: extension.config.name,
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
