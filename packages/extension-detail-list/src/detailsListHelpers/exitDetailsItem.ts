import type { Editor } from '@tiptap/core'
import type { ResolvedPos } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'

export const exitDetailsContent = (editor: Editor) => {
  const {
    $anchor, empty: emptySelection,
  } = editor.state.selection

  const $content = editor.state.doc.resolve($anchor.start() - 1)

  const isAtBlockStart = $anchor.parentOffset === 0
  const isLastBlock = $anchor.end() === $content.end() - 1

  if (!isAtBlockStart || !emptySelection || !isLastBlock) {
    return false
  }

  const slice = editor.state.doc.slice($anchor.start() - 1, $anchor.end() + 1)

  return editor.chain()
    .command(({ tr }) => {
      const $detailsNode = tr.doc.resolve(tr.selection.$anchor.end() + 2) as ResolvedPos

      tr.setSelection(TextSelection.create(tr.doc, $detailsNode.end()))
      return true
    })
    .insertContent(JSON.parse(JSON.stringify(slice.content)))
    .deleteRange({
      from: $anchor.start() - 1,
      to: $anchor.end() + 1,
    })
    .run()
}
