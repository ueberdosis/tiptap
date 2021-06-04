import { MarkType } from 'prosemirror-model'
import { RawCommands } from '../types'
import getMarkType from '../helpers/getMarkType'
import getMarkAttributes from '../helpers/getMarkAttributes'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setMark: {
      /**
       * Add a mark with new attributes.
       */
      setMark: (typeOrName: string | MarkType, attributes?: Record<string, any>) => ReturnType,
    }
  }
}

export const setMark: RawCommands['setMark'] = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  const { selection } = tr
  const { empty, ranges } = selection
  const type = getMarkType(typeOrName, state.schema)

  if (dispatch) {
    if (empty) {
      const oldAttributes = getMarkAttributes(state, type)

      tr.addStoredMark(type.create({
        ...oldAttributes,
        ...attributes,
      }))
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
                tr.addMark(trimmedFrom, trimmedTo, type.create({
                  ...mark.attrs,
                  ...attributes,
                }))
              }
            })
          } else {
            tr.addMark(trimmedFrom, trimmedTo, type.create(attributes))
          }
        })
      })
    }
  }

  return true
}
