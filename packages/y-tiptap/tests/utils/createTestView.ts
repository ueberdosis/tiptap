import type { Schema } from 'prosemirror-model'
import type { Awareness } from 'y-protocols/awareness'
import type { Doc } from 'yjs'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { yCursorPlugin, ySyncPlugin, yUndoPlugin } from '@tiptap/y-tiptap'
import { schema } from './testSchema.js'

export const createTestView = (
  document: Doc,
  viewSchema: Schema = schema,
  withUndo = false,
  awareness?: Awareness,
) =>
  new EditorView(null, {
    state: EditorState.create({
      schema: viewSchema,
      plugins: [
        ySyncPlugin(document.getXmlFragment('prosemirror')),
        ...(withUndo ? [yUndoPlugin()] : []),
        ...(awareness ? [yCursorPlugin(awareness)] : []),
      ],
    }),
  })
