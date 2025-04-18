import type { Fragment, Schema } from '@tiptap/pm/model'
import { DOMSerializer } from '@tiptap/pm/model'

export function getHTMLFromFragment(fragment: Fragment, schema: Schema): string {
  const documentFragment = DOMSerializer.fromSchema(schema).serializeFragment(fragment)

  const temporaryDocument = document.implementation.createHTMLDocument()
  const container = temporaryDocument.createElement('div')

  container.appendChild(documentFragment)

  return container.innerHTML
}
