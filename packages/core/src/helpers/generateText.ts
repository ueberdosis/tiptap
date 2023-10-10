import { Node } from '@tiptap/pm/model'

import { Extensions, JSONContent, TextSerializer } from '../types.js'
import { getSchema } from './getSchema.js'
import { getText } from './getText.js'
import { getTextSerializersFromSchema } from './getTextSerializersFromSchema.js'

export function generateText(
  doc: JSONContent,
  extensions: Extensions,
  options?: {
    blockSeparator?: string
    textSerializers?: Record<string, TextSerializer>
  },
): string {
  const { blockSeparator = '\n\n', textSerializers = {} } = options || {}
  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getText(contentNode, {
    blockSeparator,
    textSerializers: {
      ...getTextSerializersFromSchema(schema),
      ...textSerializers,
    },
  })
}
