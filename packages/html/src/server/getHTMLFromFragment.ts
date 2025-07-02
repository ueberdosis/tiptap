import type { Node, Schema } from '@tiptap/pm/model'
import { DOMSerializer } from '@tiptap/pm/model'

/**
 * Returns the HTML string representation of a given document node.
 *
 * @param doc - The document node to serialize.
 * @param schema - The Prosemirror schema to use for serialization.
 * @returns A promise containing the HTML string representation of the document fragment.
 *
 * @example
 * ```typescript
 * const html = getHTMLFromFragment(doc, schema)
 * ```
 */
export async function getHTMLFromFragment(
  doc: Node,
  schema: Schema,
  options?: { document?: Document },
): Promise<string> {
  try {
    const { Window } = await import('happy-dom')

    if (options?.document) {
      // The caller is relying on their own document implementation. Use this
      // instead of the default happy-dom-without-node library.
      const wrap = options.document.createElement('div')

      DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: options.document }, wrap)
      return wrap.innerHTML
    }

    // Use happy-dom-without-node for serialization.
    const localWindow = new Window()

    const fragment = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, {
      document: localWindow.document as unknown as Document,
    })

    const serializer = new localWindow.XMLSerializer()

    return serializer.serializeToString(fragment as any)
  } catch {
    throw new Error('[getHTMLFromFragment]: Could not import happy-dom. Please ensure it is installed.')
  }
}
