import { DOMSerializer, Node, Schema } from '@tiptap/pm/model'
import { createHTMLDocument, VHTMLDocument } from 'zeed-dom'

export function getHTMLFromFragment(doc: Node, schema: Schema, options?: { document?: Document }): string {
  if (options?.document) {
    // The caller is relying on their own document implementation. Use this
    // instead of the default zeed-dom.
    const contentNode = Node.fromJSON(schema, doc);
    const wrap = document.createElement('div');
    const serializedDocument = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: options.document }, wrap);
    return wrap.innerHTML;
  }

  // Use zeed-dom for serialization.
  const document = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, {
    document: createHTMLDocument() as unknown as Document,
  }) as unknown as VHTMLDocument

  return document.render()
}
