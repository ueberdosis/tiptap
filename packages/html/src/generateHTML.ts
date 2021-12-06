import { Extensions, getSchema, JSONContent } from '@tiptap/core'
import { Node } from 'prosemirror-model'
import { getHTMLFromFragment } from './getHTMLFromFragment'

export function generateHTML(doc: JSONContent, extensions: Extensions): string {
  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHTMLFromFragment(contentNode, schema)
}
