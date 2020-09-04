import getSchema from './getSchema'
import { Node as ProseMirrorNode, DOMSerializer } from 'prosemirror-model'
import { Extensions } from '../types'
import { Schema } from 'prosemirror-model'

export default function generateHtml(doc: object, schema: (Extensions | Schema)): string {
  let useSchema

  if (Array.isArray(schema)) {
    useSchema = getSchema(schema as Extensions)
  } else {
    useSchema = schema as Schema
  }

  const contentNode = ProseMirrorNode.fromJSON(useSchema, doc)
  const temporaryDocument = document.implementation.createHTMLDocument()
  const container = temporaryDocument.createElement('div')

  const fragment = DOMSerializer
    .fromSchema(useSchema)
    .serializeFragment(contentNode.content)

  container.appendChild(fragment)

  return container.innerHTML
}
