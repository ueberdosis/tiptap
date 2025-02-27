import { Node } from '@tiptap/pm/model'

import type { Extensions, JSONContent, TextSerializer } from '../types.js'
import { getSchema } from './getSchema.js'
import { getText } from './getText.js'
import { getTextSerializersFromSchema } from './getTextSerializersFromSchema.js'

/**
 * Generate raw text from a JSONContent
 * @param doc The JSONContent to generate text from
 * @param extensions The extensions to use for the schema
 * @param options Options for the text generation f.e. blockSeparator or textSerializers
 * @returns The generated text
 */
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
