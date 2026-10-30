import type { Schema } from '@tiptap/pm/model'

import type { ExtensionAttribute } from '../types.js'

/**
 * Combines external attribute structure with local attribute behavior.
 * @param attributes The attributes from resolved local extensions
 * @param schema The schema that defines the allowed attributes
 * @returns Only attributes present in the schema
 */
export function getSchemaAttributes(
  attributes: ExtensionAttribute[],
  schema: Schema,
): ExtensionAttribute[] {
  const attributesByType = new Map<string, Map<string, ExtensionAttribute>>()

  for (const attribute of attributes) {
    const typeAttributes =
      attributesByType.get(attribute.type) ?? new Map<string, ExtensionAttribute>()
    typeAttributes.set(attribute.name, attribute)
    attributesByType.set(attribute.type, typeAttributes)
  }

  return [...Object.values(schema.nodes), ...Object.values(schema.marks)].flatMap(type =>
    Object.entries(type.spec.attrs ?? {}).map(([name, spec]) => {
      const local = attributesByType.get(type.name)?.get(name)
      const hasDefault = Object.hasOwn(spec, 'default')

      return {
        type: type.name,
        name,
        attribute: {
          rendered: true,
          renderHTML: null,
          parseHTML: null,
          keepOnSplit: true,
          ...local?.attribute,
          default: spec.default,
          isRequired: !hasDefault,
          validate: spec.validate,
        },
      }
    }),
  )
}
