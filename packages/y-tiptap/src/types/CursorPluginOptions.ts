import type { EditorState, Selection } from 'prosemirror-state'
import type { DecorationAttrs } from 'prosemirror-view'
import type { CursorUser } from './CursorUser.js'

/** Options for rendering and publishing awareness cursors. */
export interface CursorPluginOptions {
  awarenessStateFilter?: (
    currentClientId: number,
    userClientId: number,
    state: Record<string, unknown>,
  ) => boolean
  cursorBuilder?: (user: CursorUser, clientId: number) => HTMLElement
  selectionBuilder?: (user: CursorUser, clientId: number) => DecorationAttrs
  getSelection?: (state: EditorState) => Selection
}
