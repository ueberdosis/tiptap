import { Node } from 'prosemirror-model'
import getSchema from './getSchema'
import getHTMLFromFragment from './getHTMLFromFragment'
import { Extensions } from '../types'

export default function generateHTML(doc: object, extensions: Extensions): string {
  const schema = getSchema(extensions)
  const contentNode = Node.fromJSON(schema, doc)

  return getHTMLFromFragment(contentNode, schema)
}
