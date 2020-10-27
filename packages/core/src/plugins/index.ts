import { keymap } from 'prosemirror-keymap'
import {
  baseKeymap, chainCommands, newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock,
} from 'prosemirror-commands'
import { canSplit } from 'prosemirror-transform'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { undoInputRule } from 'prosemirror-inputrules'
import {
  EditorState, NodeSelection, TextSelection, Transaction,
} from 'prosemirror-state'
import { ContentMatch, Fragment } from 'prosemirror-model'
import editable from './editable'
import focus from './focus'

function defaultBlockAt(match: ContentMatch) {
  for (let i = 0; i < match.edgeCount; i + 1) {
    const { type } = match.edge(i)
    // @ts-ignore
    if (type.isTextblock && !type.hasRequiredAttrs()) return type
  }
  return null
}

// eslint-disable-next-line
function customSplitBlock(state: EditorState, dispatch?: (tr: Transaction) => void) {
  const { $from, $to } = state.selection
  if (state.selection instanceof NodeSelection && state.selection.node.isBlock) {
    if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) return false
    if (dispatch) dispatch(state.tr.split($from.pos).scrollIntoView())
    return true
  }

  if (!$from.parent.isBlock) return false

  if (dispatch) {
    const atEnd = $to.parentOffset === $to.parent.content.size
    const { tr } = state
    if (state.selection instanceof TextSelection) tr.deleteSelection()
    const deflt = $from.depth === 0 ? null : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)))
    let types = atEnd && deflt ? [{ type: deflt, attrs: $from.node().attrs }] : null
    console.log(1, { types })
    // let types = atEnd && deflt ? [{ type: deflt }] : null
    // @ts-ignore
    let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types)
    // @ts-ignore
    if (!types && !can && canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt && [{ type: deflt }])) {
      // @ts-ignore
      types = [{ type: deflt, attrs: $from.node().attrs }]
      console.log(2, { types })
      // types = [{ type: deflt }]
      can = true
    }
    if (can) {
      // @ts-ignore
      tr.split(tr.mapping.map($from.pos), 1, types)
      if (!atEnd && !$from.parentOffset && $from.parent.type !== deflt
      // @ts-ignore
          && $from.node(-1).canReplace($from.index(-1), $from.indexAfter(-1), Fragment.from(deflt.create(), $from.parent))) { tr.setNodeMarkup(tr.mapping.map($from.before()), deflt) }
    }
    dispatch(tr.scrollIntoView())
  }
  return true
}

export default [
  () => dropCursor(),
  () => gapCursor(),
  () => keymap({ Backspace: undoInputRule }),
  () => keymap({
    ...baseKeymap,
    Enter: chainCommands(
      newlineInCode,
      createParagraphNear,
      liftEmptyBlock,
      splitBlock,
      // customSplitBlock,
    ),
  }),
  editable,
  focus,
]
