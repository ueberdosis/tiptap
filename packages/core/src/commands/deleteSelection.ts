import type { ResolvedPos, Schema } from '@tiptap/pm/model'

import type { RawCommands } from '../types.js'

/**
 * Check if a node has text content based on its content specification.
 * Returns true if the node's content spec matches text* or text+ patterns.
 */
const hasTextContent = (nodeSpec: { content?: string }): boolean => {
  if (!nodeSpec.content) {
    return false
  }
  const textRegex = /^text(\*|\+)/
  return textRegex.test(nodeSpec.content)
}

/**
 * Expand selection position for a specific side (left or right) to handle inline text nodes.
 * This function checks if the position is within an inline node with text content and
 * expands it to include the entire node boundaries for proper deletion.
 * @param $pos - The resolved position to expand
 * @param schema - The ProseMirror schema
 * @param side - Which side to expand ('left' or 'right')
 * @returns The expanded position for deletion
 */
const expandSelectionForSide = (
  $pos: ResolvedPos,
  schema: Schema,
  side: 'left' | 'right',
): number => {
  if (!$pos.parent.isInline) {
    return $pos.pos
  }

  if ((side === 'left' && $pos.pos > $pos.start()) || (side === 'right' && $pos.pos < $pos.end())) {
    return $pos.pos
  }

  const parentContent = schema.nodes[$pos.parent.type.name].spec
  if (!hasTextContent(parentContent)) {
    return $pos.pos
  }

  return side === 'left' ? $pos.start() - 1 : $pos.end() + 1
}

/**
 * Expand selection range to properly handle deletion of inline text nodes.
 * Inline text nodes don't collapse correctly when text inside is deleted,
 * so we need to expand the selection to include the entire node.
 * See: https://code.haverbeke.berlin/prosemirror/prosemirror/issues/1365
 */
const expandSelectionForInlineText = (
  $from: ResolvedPos,
  $to: ResolvedPos,
  schema: Schema,
): { from: number; to: number } => {
  const from = expandSelectionForSide($from, schema, 'left')
  const to = expandSelectionForSide($to, schema, 'right')

  return { from, to }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deleteSelection: {
      /**
       * Delete the selection, if there is one.
       * @example editor.commands.deleteSelection()
       */
      deleteSelection: () => ReturnType
    }
  }
}

export const deleteSelection: RawCommands['deleteSelection'] =
  () =>
  ({ state, dispatch }) => {
    const { $from, $to } = state.selection
    if (state.selection.empty) {
      return false
    }

    const { from, to } = expandSelectionForInlineText($from, $to, state.schema)

    if (dispatch) {
      state.tr.deleteRange(from, to).scrollIntoView()
      dispatch(state.tr)
    }

    return true
  }
