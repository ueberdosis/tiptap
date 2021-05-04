import { MarkType, Schema } from 'prosemirror-model'

export default function getMarkType(nameOrType: string | MarkType, schema: Schema): MarkType {
  if (typeof nameOrType === 'string') {
    if (!schema.marks[nameOrType]) {
      throw Error(`There is no mark type named '${nameOrType}'. Maybe you forgot to add the extension?`)
    }

    return schema.marks[nameOrType]
  }

  return nameOrType
}
