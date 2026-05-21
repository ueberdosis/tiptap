/**
 * Read-only preview of the experimental React-native renderer.
 *
 * Renders a static ProseMirror document through our new
 * `<DocNodeView>` component — no editor, no transactions, no typing
 * yet. This is the smallest possible end-to-end check that the
 * renderer mounts in a real browser.
 */

import { Schema } from '@tiptap/pm/model'
import { DocNodeView } from '@tiptap/react/renderer'
import React from 'react'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'text*' },
    text: { group: 'inline' },
  },
})

const doc = schema.nodes.doc!.create(null, [
  schema.nodes.paragraph!.create(null, [schema.text('Hello from the React renderer.')]),
  schema.nodes.paragraph!.create(null, [schema.text('This document is rendered entirely by React components.')]),
  schema.nodes.paragraph!.create(null, [schema.text('No editor yet — typing comes in the next slice.')]),
])

export default () => (
  <div style={{ maxWidth: 640, margin: '2rem auto', fontFamily: 'system-ui' }}>
    <h2>React Renderer Canary — Read-only Preview</h2>
    <p style={{ color: '#666' }}>
      A static ProseMirror doc rendered through <code>&lt;DocNodeView&gt;</code>. Open devtools to inspect: each
      paragraph is a real <code>&lt;p&gt;</code>, each text run wears a <code>&lt;span&gt;</code>, and every DOM node
      has a<code> pmViewDesc</code> back-pointer.
    </p>
    <hr />
    <DocNodeView doc={doc} />
  </div>
)
