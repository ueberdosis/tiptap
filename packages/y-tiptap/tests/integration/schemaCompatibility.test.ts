import { Schema } from 'prosemirror-model'
import type { Node } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { nodes, marks } from 'prosemirror-schema-basic'
import { prosemirrorToYXmlFragment, yDocToProsemirrorJSON, ySyncPlugin } from '@tiptap/y-tiptap'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'

const richSchema = new Schema({
  nodes: { ...nodes, secret: { group: 'block', content: 'text*' } },
  marks: { ...marks, secretMark: {} },
})
const narrowSchema = new Schema({ nodes, marks })
const titledSchema = new Schema({ nodes: { ...nodes, doc: { content: 'heading block*' } }, marks })
const paragraphSchema = new Schema({ nodes: { ...nodes, doc: { content: 'paragraph+' } }, marks })

const paragraph = (text: string) => richSchema.node('paragraph', null, richSchema.text(text))
const doc = (...content: Node[]) => richSchema.node('doc', null, content)

const cases: [string, Node, Schema, string][] = [
  [
    'an unknown node',
    doc(paragraph('Before'), richSchema.node('secret', null, richSchema.text('Hidden'))),
    narrowSchema,
    'doc(paragraph("Before!"))',
  ],
  [
    'an unknown mark',
    doc(
      richSchema.node(
        'paragraph',
        null,
        richSchema.text('Hidden', [richSchema.mark('secretMark')]),
      ),
    ),
    narrowSchema,
    'doc(paragraph("!"))',
  ],
  [
    'a missing required node',
    doc(paragraph('Body')),
    titledSchema,
    'doc(heading, paragraph("Body!"))',
  ],
  [
    'a block the document does not allow',
    doc(richSchema.node('heading', { level: 1 }, richSchema.text('Title')), paragraph('After')),
    paragraphSchema,
    'doc(paragraph("Title"), paragraph("After!"))',
  ],
]

describe('schema compatibility', () => {
  const documents: Y.Doc[] = []
  const views: EditorView[] = []

  afterEach(() => {
    views.forEach(view => view.destroy())
    documents.forEach(document => document.destroy())
    views.length = 0
    documents.length = 0
  })

  it.each(cases)(
    'repairs shared content with %s and keeps the editor editable',
    (_name, content, schema, expected) => {
      const document = new Y.Doc()
      documents.push(document)
      prosemirrorToYXmlFragment(content, document.getXmlFragment('prosemirror'))

      const view = new EditorView(null, {
        state: EditorState.create({
          schema,
          plugins: [ySyncPlugin(document.getXmlFragment('prosemirror'))],
        }),
      })
      views.push(view)
      view.dispatch(view.state.tr.insertText('!', view.state.doc.content.size - 1))

      expect(view.editable).toBe(true)
      expect(view.state.doc.toString()).toBe(expected)
      expect(yDocToProsemirrorJSON(document, 'prosemirror')).toEqual(view.state.doc.toJSON())
    },
  )
})
