import { Node, DOMSerializer } from 'prosemirror-model'
import { Schema } from 'prosemirror-model'
const jsdom = require('jsdom')
const { JSDOM } = jsdom

export default function getHtmlFromFragment(doc: Node, schema: Schema): string {
  const fragment = DOMSerializer
    .fromSchema(schema)
    .serializeFragment(doc.content)

  const temporaryDocument = new jsdom(`<!DOCTYPE html>`).window.document
  const container = temporaryDocument.createElement('div')
  container.appendChild(fragment)

  return container.innerHTML
}
