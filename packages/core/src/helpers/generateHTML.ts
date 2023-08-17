import { Node } from '@tiptap/pm/model'

import { Extensions, JSONContent } from '../types.js'
import { getHTMLFromFragment } from './getHTMLFromFragment.js'
import { getSchema } from './getSchema.js'

export function generateHTML(doc: JSONContent, extensions: Extensions): string {
  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHTMLFromFragment(contentNode.content, schema)
}
