import { canSplit } from 'prosemirror-transform'
import { ContentMatch, Fragment } from 'prosemirror-model'
import { NodeSelection, TextSelection } from 'prosemirror-state'
import { Command } from '../Editor'
import { createExtension } from '../Extension'

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
      splitBlock: (copyAttributes = false): Command => ({ tr, dispatch }) => {
        const { selection, doc } = tr
        const { $from, $to } = selection

        if (selection instanceof NodeSelection && selection.node.isBlock) {
          if (!$from.parentOffset || !canSplit(doc, $from.pos)) {
            return false
          }

          if (dispatch) {
            tr.split($from.pos).scrollIntoView()
          }

          return true
        }

        if (!$from.parent.isBlock) {
          return false
        }

        if (dispatch) {
          const atEnd = $to.parentOffset === $to.parent.content.size

          if (selection instanceof TextSelection) {
            tr.deleteSelection()
          }

          const deflt = $from.depth === 0
            ? undefined
            : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)))

          let types = atEnd && deflt
            ? [{ type: deflt, attrs: copyAttributes ? $from.node().attrs : {} }]
            : undefined

          let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types)

          if (
            !types
            && !can
            && canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt ? [{ type: deflt }] : undefined)
          ) {
            can = true
            types = deflt
              ? [{ type: deflt, attrs: copyAttributes ? $from.node().attrs : {} }]
              : undefined
          }

          if (can) {
            tr.split(tr.mapping.map($from.pos), 1, types)

            if (
              !atEnd
              && !$from.parentOffset
              && $from.parent.type !== deflt
              && $from.node(-1).canReplace($from.index(-1), $from.indexAfter(-1), Fragment.from(deflt?.create()))
            ) {
              tr.setNodeMarkup(tr.mapping.map($from.before()), deflt || undefined)
            }
          }

          tr.scrollIntoView()
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
