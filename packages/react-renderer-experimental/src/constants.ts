import { Schema } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'

/**
 * A minimal schema whose doc allows no content. `ReactEditorView` constructs
 * the base `EditorView` against this schema so the base class never renders
 * real document content into the mount element.
 */
export const EMPTY_SCHEMA = new Schema({
  nodes: {
    doc: { content: '' },
    text: {},
  },
})

/**
 * The state the base `EditorView` is constructed with. The real editor state
 * is applied afterwards through the pure `update()` path and committed via
 * `commitPendingEffects()`.
 */
export const EMPTY_STATE = EditorState.create({ schema: EMPTY_SCHEMA })
