import type { EditorView } from 'prosemirror-view'
import type { MetaKey } from './MetaKey.js'

export interface PendingMeta {
  view: EditorView
  key: MetaKey
  value: unknown
}
