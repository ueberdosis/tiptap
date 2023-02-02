import { Node } from '@tiptap/pm/model'

import { Extensions, JSONContent } from '../types'
import { getHTMLFromFragment } from './getHTMLFromFragment'
import { getSchema } from './getSchema'

export function generateHTML(doc: JSONContent, extensions: Extensions): string {
  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHTMLFromFragment(contentNode.content, schema)
}
