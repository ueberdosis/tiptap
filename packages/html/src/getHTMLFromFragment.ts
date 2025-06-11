import type { Node, Schema } from '@tiptap/pm/model'
import { DOMSerializer } from '@tiptap/pm/model'

import { createSafeWindow } from './createSafeWindow.js'

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
    // instead of the default happy-dom-without-node.
    const wrap = options.document.createElement('div')

    DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: options.document }, wrap)
    return wrap.innerHTML
  }

  // Use happy-dom-without-node for serialization.
  const localWindow = typeof window === 'undefined' ? createSafeWindow() : window

  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, {
    document: localWindow.document as unknown as Document,
  })

  const serializer = new localWindow.XMLSerializer()

  return serializer.serializeToString(fragment as any)
}
