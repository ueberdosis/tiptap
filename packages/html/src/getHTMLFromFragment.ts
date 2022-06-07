import { DOMSerializer, Node, Schema } from 'prosemirror-model'
import { VHTMLDocument, createHTMLDocument } from 'zeed-dom'

export function getHTMLFromFragment(doc: Node, schema: Schema): string {
  const document = DOMSerializer
    .fromSchema(schema)
    .serializeFragment(doc.content, {
      document: (createHTMLDocument() as unknown as Document),
    }) as unknown as VHTMLDocument

  return document.render()
}
