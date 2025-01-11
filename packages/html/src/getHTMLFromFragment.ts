import { DOMSerializer, Node, Schema } from '@tiptap/pm/model'
import { Window } from 'happy-dom-without-node'

/**
 * Returns the HTML string representation of a given document node.
 *
 * @param doc - The document node to serialize.
 * @param schema - The Prosemirror schema to use for serialization.
 * @returns The HTML string representation of the document fragment.
 *
 * @example
 * ```typescript
 * const html = getHTMLFromFragment(doc, schema)
 * ```
 */
export function getHTMLFromFragment(doc: Node, schema: Schema, options?: { document?: Document }): string {
  if (options?.document) {
    // The caller is relying on their own document implementation. Use this
    // instead of the default zeed-dom.
    const wrap = options.document.createElement('div')

    DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: options.document }, wrap)
    return wrap.innerHTML
  }

  // Use happy-dom for serialization.
  const browserWindow = typeof window === 'undefined' ? new Window() : window

  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, {
    document: browserWindow.document as unknown as Document,
  })

  const serializer = new browserWindow.XMLSerializer()

  return serializer.serializeToString(fragment as any)
}
