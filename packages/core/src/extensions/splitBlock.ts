// import {
//   baseKeymap, chainCommands, newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock,
// } from 'prosemirror-commands'
import { canSplit } from 'prosemirror-transform'
import { ContentMatch, Fragment } from 'prosemirror-model'
import { NodeSelection, TextSelection } from 'prosemirror-state'
import { Command } from '../Editor'
import { createExtension } from '../Extension'
// import getNodeType from '../utils/getNodeType'

function defaultBlockAt(match: ContentMatch) {
  for (let i = 0; i < match.edgeCount; i + 1) {
    const { type } = match.edge(i)
    // @ts-ignore
    if (type.isTextblock && !type.hasRequiredAttrs()) return type
  }
  return null
}

export const SplitBlock = createExtension({
  addCommands() {
    return {
      splitBlock: (copyAttributes = false): Command => ({ state, dispatch }) => {
        // const type = getNodeType(typeOrName, state.schema)

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
          let types = atEnd && deflt ? [{ type: deflt, attrs: copyAttributes ? $from.node().attrs : {} }] : null
          // let types = atEnd && deflt ? [{ type: deflt }] : null
          // @ts-ignore
          let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types)
          // @ts-ignore
          if (!types && !can && canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt && [{ type: deflt }])) {
            // @ts-ignore
            types = [{ type: deflt, attrs: copyAttributes ? $from.node().attrs : {} }]
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
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    SplitBlock: typeof SplitBlock,
  }
}
