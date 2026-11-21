import { isProseMirrorNodeSelection } from '@tiptap/core'
import type { EditorState, NodeSelection, Selection } from '@tiptap/pm/state'
import type { SyncPluginState } from '@tiptap/y-tiptap'
import { absolutePositionToRelativePosition, ySyncPluginKey } from '@tiptap/y-tiptap'
import * as Y from 'yjs'
import type { Annotation } from './types/Annotation.js'
import { getNodeAnchor } from './getNodeAnchor.js'

export function createAnnotation(state: EditorState, text: string): Annotation | null {
  const sync = ySyncPluginKey.getState(state)
  const { selection } = state

  if (!sync || !hasAnnotationSelection(selection, text)) {
    return null
  }

  if (isProseMirrorNodeSelection(selection)) {
    return createNodeAnnotation(selection, sync, text)
  }

  return {
    kind: 'text',
    from: Array.from(
      Y.encodeRelativePosition(
        absolutePositionToRelativePosition(selection.from, sync.type, sync.binding.mapping),
      ),
    ),
    to: Array.from(
      Y.encodeRelativePosition(
        absolutePositionToRelativePosition(selection.to, sync.type, sync.binding.mapping),
      ),
    ),
    text: text.trim(),
  }
}

const hasAnnotationSelection = (selection: Selection, text: string) =>
  !selection.empty && Boolean(text.trim())

function createNodeAnnotation(
  selection: NodeSelection,
  sync: SyncPluginState,
  text: string,
): Annotation | null {
  const anchor = getNodeAnchor(selection, sync)

  return anchor
    ? {
        kind: 'node',
        nodeType: selection.node.type.name,
        anchor: Array.from(Y.encodeRelativePosition(anchor)),
        text: text.trim(),
      }
    : null
}
