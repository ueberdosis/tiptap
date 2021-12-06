import { Node } from 'prosemirror-model'
import { getSchema } from './getSchema'
import { getHTMLFromFragment } from './getHTMLFromFragment'
import { Extensions, JSONContent } from '../types'

export function generateHTML(doc: JSONContent, extensions: Extensions): string {
  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHTMLFromFragment(contentNode.content, schema)
}
