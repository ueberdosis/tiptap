import type { Editor } from '@tiptap/core'
import { isProseMirrorNodeSelection } from '@tiptap/core'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'

export function moveSelectedBlock(editor: Editor) {
  const { state } = editor
  const { selection } = state
  const block = getSelectedBlock(editor)

  if (!block) {
    return
  }

  const { start, node } = block
  const target = state.doc.content.size - node.nodeSize

  if (start === target) {
    return
  }

  const transaction = state.tr.delete(start, start + node.nodeSize).insert(target, node)
  transaction.setSelection(
    isProseMirrorNodeSelection(selection)
      ? NodeSelection.create(transaction.doc, target)
      : TextSelection.near(transaction.doc.resolve(target + 1)),
  )
  editor.view.dispatch(transaction)
}

function getSelectedBlock(editor: Editor) {
  const { state } = editor
  const { selection } = state
  const start = selection.$from.depth > 0 ? selection.$from.before(1) : selection.from
  const node = state.doc.nodeAt(start)

  if (!node) {
    return null
  }

  return { start, node }
}
