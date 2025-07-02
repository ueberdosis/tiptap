import type { Node, Schema } from '@tiptap/pm/model'
import { DOMSerializer } from '@tiptap/pm/model'

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
  if (typeof window === 'undefined') {
    throw new Error(
      'getHTMLFromFragment can only be used in a browser environment\nIf you want to use this in a Node environment, use the `@tiptap/html/server` import instead.',
    )
  }

  if (options?.document) {
    // The caller is relying on their own document implementation. Use this
    // instead of the default happy-dom-without-node library.
    const wrap = options.document.createElement('div')

    DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: options.document }, wrap)
    return wrap.innerHTML
  }

  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, {
    document: window.document as unknown as Document,
  })

  const serializer = new XMLSerializer()

  return serializer.serializeToString(fragment as any)
}
