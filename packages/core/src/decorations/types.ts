import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { DecorationSet, EditorView } from '@tiptap/pm/view'

import type { Editor } from '../Editor.js'
import type { Decoration } from './Decoration.js'

export interface DecorationCreateProps {
  editor: Editor
  state: EditorState
  view: EditorView
}

export interface DecorationShouldUpdateProps {
  editor: Editor
  tr: Transaction
  oldState: EditorState
  newState: EditorState
}

export interface DecorationRangeProps extends DecorationCreateProps {
  from: number
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
