import type { ResolvedPos, Schema } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import { TextSelection } from '@tiptap/pm/state'

/**
 * Check if a node has text content based on its content specification.
 * Returns true if the node's content spec matches text* or text+ patterns.
 * @param nodeSpec - The ProseMirror node spec to inspect
 * @returns Whether the node spec declares text* or text+ content
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
 * @param $from - Start resolved position of the selection range
 * @param $to - End resolved position of the selection range
 * @param schema - The ProseMirror schema
 * @returns The expanded start and end positions for deletion
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

/**
 * Delete the current selection ranges on a transaction using inline text node expansion
 * and mark preservation consistent with the `deleteSelection` command.
 * @param tr - The transaction to mutate
 * @param schema - The ProseMirror schema used to check inline node content specs
 */
export function deleteSelectionOnTransaction(
  tr: Transaction,
  schema: Schema = tr.doc.type.schema,
): void {
  const { selection } = tr
  const { ranges } = selection
  // like ProseMirror's TextSelection.replace, keep the marks of the deleted text for the next input
  const marks =
    selection instanceof TextSelection ? selection.$from.marksAcross(selection.$to) : null
  const mapFrom = tr.steps.length

  ranges.forEach(range => {
    const mapping = tr.mapping.slice(mapFrom)
    const $from = tr.doc.resolve(mapping.map(range.$from.pos))
    const $to = tr.doc.resolve(mapping.map(range.$to.pos))
    const { from, to } = expandSelectionForInlineText($from, $to, schema)

    tr.deleteRange(from, to)
  })

  // after deleting the selection we restore a text selection
  // near the from position to avoid having confusing selections
  // after the deletion (for example after deleting via Ctrl/Cmd+A)
  if (!tr.selection.empty) {
    tr.setSelection(TextSelection.near(tr.doc.resolve(tr.selection.from)))
  }

  if (marks) {
    tr.ensureMarks(marks)
  }
}
