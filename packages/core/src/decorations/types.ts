import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { DecorationSet, EditorView } from '@tiptap/pm/view'

import type { Editor } from '../Editor.js'
import type { Decoration } from './Decoration.js'

export interface DecorationCreateProps {
  /**
   * The editor instance. Read `state` from the `state` argument, not
   * `editor.state` — during `create()` the editor's view state has not been
   * updated yet, so `editor.state` points at the pre-transaction document.
   */
  editor: Editor
  /**
   * The editor state being built. This is the correct state to read from
   * inside `create()`; `editor.state` is stale until the transaction finishes
   * applying.
   */
  state: EditorState
  /** The editor view, or `null` while the editor is not mounted. */
  view: EditorView | null
}

export interface DecorationShouldUpdateProps {
  editor: Editor
  tr: Transaction
  oldState: EditorState
  newState: EditorState
}

export interface DecorationRangeProps extends DecorationCreateProps {
  /** Start of the block range to scan, inclusive. */
  from: number
  /**
   * End of the block range to scan, exclusive. `to` is the next block's start
   * and that block rebuilds it, so decorations anchored there are ignored.
   * The last block is the exception: it owns the end of the document.
   */
  to: number
}

export type DecorationUpdateStrategy = 'document' | 'changedRanges' | 'manual'

export interface BaseDecorationSpec {
  create: (props: DecorationCreateProps) => Decoration[]
  shouldUpdate?: (props: DecorationShouldUpdateProps) => boolean
}

export interface DocumentDecorationSpec extends BaseDecorationSpec {
  update?: 'document'
  createInRange?: never
}

export interface ChangedRangesDecorationSpec extends BaseDecorationSpec {
  update: 'changedRanges'
  createInRange: (props: DecorationRangeProps) => Decoration[]
}

export interface ManualDecorationSpec extends BaseDecorationSpec {
  update: 'manual'
  shouldUpdate?: never
  createInRange?: never
}

export type DecorationSpec =
  | DocumentDecorationSpec
  | ChangedRangesDecorationSpec
  | ManualDecorationSpec

export type DecorationMeta = { type: 'force'; name?: string }

export interface DecorationManagerState {
  decorationSetsByExtension: Record<string, DecorationSet>
  widgetKeysByExtension: Record<string, Set<string>>
  mergedDecorationSet: DecorationSet
  widgetKeys: Set<string>
}

export interface ResolvedDecorationEntry {
  name: string
  spec: DecorationSpec
}

export interface DecorationManagerEntry {
  name: string
  addDecorations: () => DecorationSpec | null
}
