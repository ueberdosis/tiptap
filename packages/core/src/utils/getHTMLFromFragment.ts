import { Node, DOMSerializer, Schema } from 'prosemirror-model'

export default function getHTMLFromFragment(doc: Node, schema: Schema): string {
  const fragment = DOMSerializer
    .fromSchema(schema)
    .serializeFragment(doc.content)

  const temporaryDocument = document.implementation.createHTMLDocument()
  const container = temporaryDocument.createElement('div')
  container.appendChild(fragment)

  return container.innerHTML
}
