import { DOMSerializer, Node, Schema } from '@tiptap/pm/model'
import { createHTMLDocument, VHTMLDocument } from 'zeed-dom'

export function getHTMLFromFragment(doc: Node, schema: Schema, options?: { document?: Document }): string {
  if (options?.document) {
    // The caller is relying on their own document implementation. Use this
    // instead of the default zeed-dom.
    const wrap = options.document.createElement('div')

    DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: options.document }, wrap)
    return wrap.innerHTML
  }

  // Use zeed-dom for serialization.
  const zeedDocument = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, {
    document: createHTMLDocument() as unknown as Document,
  }) as unknown as VHTMLDocument

  return zeedDocument.render()
}
