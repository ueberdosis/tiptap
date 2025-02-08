import { NodeType } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import { findWrapping } from '@tiptap/pm/transform'

/**
 * Try searching upwards until the first valid wrapping is found.
 *
 * {@link findWrapping `ProseMirror.findWrapping`} only checks within the current `blockRange`.
 */
export const findWrappingUntil = (state: Pick<EditorState, 'selection' | 'doc'>, nodeType: NodeType) => {
  let $pos = state.selection.$from
  const $to = state.selection.$to

  for (;;) {
    const range = $pos.blockRange($to)

    if (!range) {
      return null
    }

    const wrap = findWrapping(range, nodeType)

    if (wrap) {
      return {
        range,
        wrap,
      }
    }

    if (range.depth > 0) {
      $pos = state.doc.resolve($pos.before(range.depth))
    } else {
      return null
    }
  }
}
