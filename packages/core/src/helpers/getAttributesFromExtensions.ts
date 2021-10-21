import splitExtensions from './splitExtensions'
import getExtensionField from './getExtensionField'
import {
  Extensions,
  GlobalAttributes,
  Attributes,
  Attribute,
  ExtensionAttribute,
  AnyConfig,
} from '../types'
import { NodeConfig, MarkConfig } from '..'

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
      name: extension.name,
      options: extension.options,
      storage: extension.storage,
    }

    const addGlobalAttributes = getExtensionField<AnyConfig['addGlobalAttributes']>(
      extension,
      'addGlobalAttributes',
      context,
    )

    if (!addGlobalAttributes) {
      return
    }

    // TODO: remove `as GlobalAttributes`
    const globalAttributes = addGlobalAttributes() as GlobalAttributes

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
      name: extension.name,
      options: extension.options,
      storage: extension.storage,
    }

    const addAttributes = getExtensionField<NodeConfig['addAttributes'] | MarkConfig['addAttributes']>(
      extension,
      'addAttributes',
      context,
    )

    if (!addAttributes) {
      return
    }

    // TODO: remove `as Attributes`
    const attributes = addAttributes() as Attributes

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
