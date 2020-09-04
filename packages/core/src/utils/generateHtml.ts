import getSchema from './getSchema'
import { Node as ProseMirrorNode, DOMSerializer } from 'prosemirror-model'
import { Extensions } from '../types'

export default function generateHtml(doc: object, extensions: Extensions): string {
  const schema = getSchema(extensions)

  let contentNode = ProseMirrorNode.fromJSON(schema, doc)
  let temporaryDocument = document.implementation.createHTMLDocument()
  const div = temporaryDocument.createElement('div')

  const fragment = DOMSerializer
    .fromSchema(schema)
    .serializeFragment(contentNode.content)

  div.appendChild(fragment)

  return div.innerHTML
}
