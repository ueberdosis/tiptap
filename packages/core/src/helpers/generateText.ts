import { Node } from '@tiptap/pm/model'

import { Extensions, JSONContent, TextSerializer } from '../types'
import { getSchema } from './getSchema'
import { getText } from './getText'
import { getTextSerializersFromSchema } from './getTextSerializersFromSchema'

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
