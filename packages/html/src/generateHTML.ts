import { Extensions, getSchema } from '@tiptap/core'
import { Node } from 'prosemirror-model'
import getHTMLFromFragment from './getHTMLFromFragment'

export default function generateHTML(doc: object, extensions: Extensions): string {
  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHTMLFromFragment(contentNode, schema)
}
