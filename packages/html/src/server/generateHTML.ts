import { type Extensions, type JSONContent, getSchema } from '@tiptap/core'
import { Node } from '@tiptap/pm/model'

import { getHTMLFromFragment } from './getHTMLFromFragment.js'

export async function generateHTML(doc: JSONContent, extensions: Extensions): Promise<string> {
  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHTMLFromFragment(contentNode, schema)
}
