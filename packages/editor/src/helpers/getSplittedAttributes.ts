import type { ExtensionAttribute } from '../types.js'

/**
 * Return attributes of an extension that should be splitted by keepOnSplit flag
 * @param extensionAttributes Array of extension attributes
 * @param typeName The type of the extension
 * @param attributes The attributes of the extension
 * @returns The splitted attributes
 */
export function getSplittedAttributes(
  extensionAttributes: ExtensionAttribute[],
  typeName: string,
  attributes: Record<string, any>,
): Record<string, any> {
  return Object.fromEntries(
    Object.entries(attributes).filter(([name]) => {
      const extensionAttribute = extensionAttributes.find(item => {
        return item.type === typeName && item.name === name
      })

      if (!extensionAttribute) {
        return false
      }

      return extensionAttribute.attribute.keepOnSplit
    }),
  )
}
