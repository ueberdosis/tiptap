import type { Mark } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { DecorationAttrs, EditorView } from '@tiptap/pm/view'

import type { Editor } from '../../Editor.js'

export interface NodeDecorationDescriptor {
  kind: 'node'
  from: number
  to: number
  attrs: DecorationAttrs
  spec?: Record<string, any>
}
export interface InlineDecorationDescriptor {
  kind: 'inline'
  from: number
  to: number
  attrs: DecorationAttrs
  spec?: Record<string, any>
}
export interface WidgetDecorationDescriptor {
  kind: 'widget'
  pos: number
  render: (view: EditorView, getPos: () => number | undefined) => HTMLElement
  /**
   * A stable, position-independent identifier for this widget.
   *
   * ProseMirror reuses a widget's DOM across redraws only when this `key`
   * matches the previous render. Without a stable key the widget is destroyed
   * and recreated on every update, causing flicker and lost component state.
   * Derive it from a domain identifier (e.g. `comment-${id}`), never from the
   * position (which changes as the document is edited).
   */
  key: string
  spec?: {
    side?: number
    marks?: readonly Mark[]
    stopEvent?: (e: Event) => boolean
    [k: string]: any
  }
}
export type DecorationDescriptor =
  | NodeDecorationDescriptor
  | InlineDecorationDescriptor
  | WidgetDecorationDescriptor

/**
 * The context passed to `create` when an extension builds its decorations.
 * `view` is the live editor view; it is always available because decorations
 * are only computed once the editor is mounted.
 */
export interface DecorationCreateProps {
  editor: Editor
  state: EditorState
  view: EditorView
}

/**
 * The context passed to `shouldUpdate` to decide whether an extension's
 * decorations need to be recomputed for the given transaction.
 */
export interface DecorationShouldUpdateProps {
  editor: Editor
  tr: Transaction
  oldState: EditorState
  newState: EditorState
}

/**
 * The descriptor returned from an extension's `addDecorations`.
 */
export interface DecorationSpec {
  /**
   * Build the full set of this extension's decorations from the current state.
   */
  create: (props: DecorationCreateProps) => DecorationDescriptor[]
  /**
   * Gate recomputation for performance. Return `false` to keep the existing
   * decorations mapped through the transaction instead of rebuilding them.
   * Defaults to recomputing whenever the document changes (`tr.docChanged`).
   */
  shouldUpdate?: (props: DecorationShouldUpdateProps) => boolean
}

/**
 * Transaction metadata understood by the decoration manager. Used by the
 * imperative `updateDecorations` / `clearDecorations` commands.
 */
export type DecorationMeta = { type: 'force'; name?: string } | { type: 'clear' }
