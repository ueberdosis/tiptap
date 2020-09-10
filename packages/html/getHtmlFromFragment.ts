import { Node, DOMSerializer } from 'prosemirror-model'
import { Schema } from 'prosemirror-model'
import { JSDOM } from 'jsdom'

export default function getHtmlFromFragment(doc: Node, schema: Schema): string {
  const fragment = DOMSerializer
    .fromSchema(schema)
    .serializeFragment(doc.content)

  const temporaryDocument = new JSDOM(`<!DOCTYPE html>`).window.document
  const container = temporaryDocument.createElement('div')
  container.appendChild(fragment)

  return container.innerHTML
}
