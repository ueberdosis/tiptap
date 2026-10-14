import type { RelativeSelection } from '../../../types/RelativeSelection.js'
import type { EditorState } from 'prosemirror-state'
import { absolutePositionToRelativePosition } from './absolutePositionToRelativePosition.js'
import type { ProsemirrorBinding } from '../binding/ProsemirrorBinding.js'

/** Captures the current selection as Yjs relative positions and absolute fallback positions. */
export const getRelativeSelection = (
  pmbinding: ProsemirrorBinding,
  state: EditorState,
): RelativeSelection => {
  const selection = state.selection
  const json: Record<string, unknown> = selection.toJSON()
  const type = typeof json.type === 'string' ? json.type : 'text'
  return {
    type,
    depth:
      type === 'nodeRange' && 'depth' in selection && typeof selection.depth === 'number'
        ? selection.depth
        : undefined,
    anchor: absolutePositionToRelativePosition(
      state.selection.anchor,
      pmbinding.type,
      pmbinding.mapping,
    ),
    head: absolutePositionToRelativePosition(
      state.selection.head,
      pmbinding.type,
      pmbinding.mapping,
    ),
    absAnchor: state.selection.anchor,
    absHead: state.selection.head,
  }
}
