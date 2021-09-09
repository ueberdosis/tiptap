import { Node } from 'prosemirror-model'
import getSchema from './getSchema'
import { Extensions, JSONContent, TextSerializer } from '../types'
import getTextSeralizersFromSchema from './getTextSeralizersFromSchema'
import getText from './getText'

export default function generateText(
  doc: JSONContent,
  extensions: Extensions,
  options?: {
    blockSeparator?: string,
    textSerializers?: Record<string, TextSerializer>,
  },
): string {
  const {
    blockSeparator = '\n\n',
    textSerializers = {},
  } = options || {}
  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getText(contentNode, {
    blockSeparator,
    textSerializers: {
      ...textSerializers,
      ...getTextSeralizersFromSchema(schema),
    },
  })
}
