import { DOMSerializer, Fragment, Schema } from '@tiptap/pm/model'

export function getHTMLFromFragment(fragment: Fragment, schema: Schema): string {
  const documentFragment = DOMSerializer.fromSchema(schema).serializeFragment(fragment)

  // remove the data-node-type attribute
  documentFragment.querySelectorAll('[data-tiptap]').forEach(node => {
    node.removeAttribute('data-tiptap')
  })

  const temporaryDocument = document.implementation.createHTMLDocument()
  const container = temporaryDocument.createElement('div')

  container.appendChild(documentFragment)

  return container.innerHTML
}
