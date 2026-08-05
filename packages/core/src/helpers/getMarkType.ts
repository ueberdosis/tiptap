import type { MarkType, Schema } from '@tiptap/pm/model'

/**
 * Look up a mark type in the schema.
 * @throws If the schema has no mark with that name.
 */
export function getMarkType(nameOrType: string | MarkType, schema: Schema): MarkType {
  if (typeof nameOrType === 'string') {
    if (!schema.marks[nameOrType]) {
      throw Error(
        `There is no mark type named '${nameOrType}'. Maybe you forgot to add the extension?`,
      )
    }

    return schema.marks[nameOrType]
  }

  return nameOrType
}
