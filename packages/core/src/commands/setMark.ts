import type { MarkType, ResolvedPos } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'

import { getMarkAttributes } from '../helpers/getMarkAttributes.js'
import { getMarkType } from '../helpers/getMarkType.js'
import { isTextSelection } from '../helpers/index.js'
import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setMark: {
      /**
       * Add a mark with new attributes.
       * @param typeOrName The mark type or name.
       * @example editor.commands.setMark('bold', { level: 1 })
       */
      setMark: (typeOrName: string | MarkType, attributes?: Record<string, any>) => ReturnType
    }
  }
}

function canSetMark(state: EditorState, tr: Transaction, newMarkType: MarkType) {
  const { selection } = tr
  let cursor: ResolvedPos | null = null

  if (isTextSelection(selection)) {
    cursor = selection.$cursor
  }

  if (cursor) {
    const currentMarks = state.storedMarks ?? cursor.marks()
    const parentAllowsMarkType = cursor.parent.type.allowsMarkType(newMarkType)

    // There can be no current marks that exclude the new mark, and the parent must allow this mark type
    return (
      parentAllowsMarkType &&
      (!!newMarkType.isInSet(currentMarks) || !currentMarks.some(mark => mark.type.excludes(newMarkType)))
    )
  }

  const { ranges } = selection

  return ranges.some(({ $from, $to }) => {
    let someNodeSupportsMark =
      $from.depth === 0 ? state.doc.inlineContent && state.doc.type.allowsMarkType(newMarkType) : false

    state.doc.nodesBetween($from.pos, $to.pos, (node, _pos, parent) => {
      // If we already found a mark that we can enable, return false to bypass the remaining search
      if (someNodeSupportsMark) {
        return false
      }

      if (node.isInline) {
        const parentAllowsMarkType = !parent || parent.type.allowsMarkType(newMarkType)
        const currentMarksAllowMarkType =
          !!newMarkType.isInSet(node.marks) || !node.marks.some(otherMark => otherMark.type.excludes(newMarkType))

        someNodeSupportsMark = parentAllowsMarkType && currentMarksAllowMarkType
      }
      return !someNodeSupportsMark
    })

    return someNodeSupportsMark
  })
}
export const setMark: RawCommands['setMark'] =
  (typeOrName, attributes = {}) =>
  ({ tr, state, dispatch }) => {
    const { selection } = tr
    const { empty, ranges } = selection
    const type = getMarkType(typeOrName, state.schema)

    if (dispatch) {
      if (empty) {
        const oldAttributes = getMarkAttributes(state, type)

        tr.addStoredMark(
          type.create({
            ...oldAttributes,
            ...attributes,
          }),
        )
      } else {
        ranges.forEach(range => {
          const from = range.$from.pos
          const to = range.$to.pos

          state.doc.nodesBetween(from, to, (node, pos) => {
            const trimmedFrom = Math.max(pos, from)
            const trimmedTo = Math.min(pos + node.nodeSize, to)
            const someHasMark = node.marks.find(mark => mark.type === type)

            // if there is already a mark of this type
            // we know that we have to merge its attributes
            // otherwise we add a fresh new mark
            if (someHasMark) {
              node.marks.forEach(mark => {
                if (type === mark.type) {
                  tr.addMark(
                    trimmedFrom,
                    trimmedTo,
                    type.create({
                      ...mark.attrs,
                      ...attributes,
                    }),
                  )
                }
              })
            } else {
              tr.addMark(trimmedFrom, trimmedTo, type.create(attributes))
            }
          })
        })
      }
    }

    return canSetMark(state, tr, type)
  }
