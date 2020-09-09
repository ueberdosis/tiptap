import { Extensions, getSchema } from '@tiptap/core'
import { Node } from 'prosemirror-model'
import getHtmlFromFragment from './getHtmlFromFragment'

export default function generateHtml(doc: object, extensions: Extensions): string {
  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHtmlFromFragment(contentNode, schema)
}
