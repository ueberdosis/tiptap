/**
 * Custom `EditorView` subclass for the React-native renderer.
 *
 * Currently identical to PM's `EditorView` — this slice just proves
 * the wire-up (via `editorViewClass`). Future slices override the
 * DOM-mutating paths so React can own the DOM.
 */

import { EditorView } from '@tiptap/pm/view'

export class ReactEditorView extends EditorView {
  /** Marker so consumers (and the DOM observer) can branch on the renderer. */
  readonly isReactEditorView = true
}
