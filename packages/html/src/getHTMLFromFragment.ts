import { Node, DOMSerializer, Schema } from 'prosemirror-model'
import { createHTMLDocument, VHTMLDocument } from 'zeed-dom'

export default function getHTMLFromFragment(doc: Node, schema: Schema): string {
  const document = DOMSerializer
    .fromSchema(schema)
    .serializeFragment(doc.content, {
      document: createHTMLDocument(),
    }) as unknown as VHTMLDocument

  return document.render()
}
