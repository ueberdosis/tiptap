import { Node, DOMSerializer, Schema } from 'prosemirror-model'
// @ts-ignore
import { createHTMLDocument } from 'hostic-dom'

export default function getHTMLFromFragment(doc: Node, schema: Schema): string {
  return DOMSerializer
    .fromSchema(schema)
    .serializeFragment(doc.content, {
      document: createHTMLDocument(),
    })
    // @ts-ignore
    .render()
}
