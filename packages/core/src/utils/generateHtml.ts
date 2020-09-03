import Extension from '../Extension'
import Node from '../Node'
import Mark from '../Mark'
import getSchema from './getSchema'
import { Node as ProseMirrorNode, DOMSerializer } from "prosemirror-model"

export default function generateHtml(doc: object, extensions: (Extension | Node | Mark)[]): string {
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
